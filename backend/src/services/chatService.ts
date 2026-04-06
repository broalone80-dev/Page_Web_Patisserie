import prisma from '@config/database';
import { emitToOrder } from '@config/websocket';
import { NotificationService } from './notificationService';

/**
 * Chat Service – Order-linked messaging
 */
export class ChatService {
    /**
     * Send a message in an order thread
     */
    static async sendMessage(orderId: string, senderId: string, content: string) {
        // Verify the order exists and sender has access
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { id: true, userId: true, orderNumber: true },
        });

        if (!order) {
            throw new Error('Commande introuvable');
        }

        // Check access: either the order owner or an admin
        const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { id: true, isAdmin: true, isManager: true, fullName: true, email: true },
        });

        if (!sender) {
            throw new Error('Utilisateur introuvable');
        }

        if (!sender.isAdmin && !sender.isManager && order.userId !== senderId) {
            throw new Error('Accès non autorisé');
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                orderId,
                senderId,
                content,
            },
            include: {
                sender: {
                    select: { id: true, fullName: true, isAdmin: true, isManager: true },
                },
            },
        });

        // Real-time broadcast to order room
        try {
            emitToOrder(orderId, 'new_message', {
                id: message.id,
                orderId: message.orderId,
                senderId: message.senderId,
                content: message.content,
                sender: message.sender,
                createdAt: message.createdAt,
            });
        } catch {
            // Socket not available
        }

        // Notify the recipient
        const isStaff = sender.isAdmin || sender.isManager;
        const recipientId = isStaff ? order.userId : null;
        if (recipientId) {
            await NotificationService.notifyNewMessage(
                recipientId,
                sender.fullName || 'GuiGui Support',
                orderId,
                order.orderNumber
            );
        } else if (!isStaff) {
            // Client sent message → notify all admins & managers
            const staff = await prisma.user.findMany({
                where: { OR: [{ isAdmin: true }, { isManager: true }], isActive: true },
                select: { id: true },
            });
            for (const s of staff) {
                await NotificationService.notifyNewMessage(
                    s.id,
                    sender.fullName || 'Client',
                    orderId,
                    order.orderNumber
                );
            }
        }

        return message;
    }

    /**
     * Get messages for an order (paginated)
     */
    static async getOrderMessages(orderId: string, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [messages, total] = await Promise.all([
            prisma.message.findMany({
                where: { orderId },
                include: {
                    sender: {
                        select: { id: true, fullName: true, isAdmin: true, avatarUrl: true },
                    },
                },
                orderBy: { createdAt: 'asc' },
                skip,
                take: limit,
            }),
            prisma.message.count({ where: { orderId } }),
        ]);

        return { messages, total, page, totalPages: Math.ceil(total / limit) };
    }

    /**
     * Mark messages as read for a user in an order
     */
    static async markAsRead(orderId: string, userId: string) {
        await prisma.message.updateMany({
            where: {
                orderId,
                senderId: { not: userId },
                isRead: false,
            },
            data: { isRead: true },
        });
    }

    /**
     * Get unread message count per order for a user
     */
    static async getUnreadCounts(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isAdmin: true },
        });

        let orderFilter: any = {};
        if (!user?.isAdmin) {
            orderFilter = { userId };
        }

        const orders = await prisma.order.findMany({
            where: orderFilter,
            select: {
                id: true,
                orderNumber: true,
                messages: {
                    where: {
                        senderId: { not: userId },
                        isRead: false,
                    },
                    select: { id: true },
                },
            },
        });

        return orders
            .filter((o: any) => o.messages.length > 0)
            .map((o: any) => ({
                orderId: o.id,
                orderNumber: o.orderNumber,
                unread: o.messages.length,
            }));
    }
}
