import prisma from '@config/database';
import { emitToUser } from '@config/websocket';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from './emailService';

/**
 * Notification Service
 * Handles in-app, email, and SMS notifications
 */

interface CreateNotificationInput {
    userId: string;
    type: string;
    title: string;
    body: string;
    channel?: string;
    metadata?: Record<string, any>;
}

export class NotificationService {
    /**
     * Create and dispatch a notification
     */
    static async create(input: CreateNotificationInput) {
        const notification = await prisma.notification.create({
            data: {
                userId: input.userId,
                type: input.type,
                title: input.title,
                body: input.body,
                channel: input.channel || 'in_app',
                metadata: input.metadata || {},
                status: 'sent',
            },
        });

        // Real-time: push to user via WebSocket
        try {
            emitToUser(input.userId, 'notification', {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                body: notification.body,
                createdAt: notification.createdAt,
            });
        } catch {
            // Socket not available, notification still saved in DB
        }

        return notification;
    }

    /**
     * Notify admin(s) when a new order is placed
     */
    static async notifyNewOrder(orderNumber: string, totalCents: number) {
        const admins = await prisma.user.findMany({
            where: { isAdmin: true, isActive: true },
            select: { id: true, email: true, phone: true },
        });

        for (const admin of admins) {
            // In-app notification
            await this.create({
                userId: admin.id,
                type: 'order_created',
                title: 'Nouvelle commande',
                body: `Commande #${orderNumber} – ${(totalCents / 100).toLocaleString('fr-FR')} FCFA`,
                channel: 'in_app',
            });

            // Email notification
            if (admin.email) {
                await sendOrderConfirmationEmail(admin.email, orderNumber, totalCents);
            }
        }
    }

    /**
     * Notify client when order status changes
     */
    static async notifyOrderStatusChange(
        userId: string,
        orderNumber: string,
        status: string,
        email?: string | null
    ) {
        const statusLabels: Record<string, string> = {
            en_preparation: 'En préparation',
            validee: 'Validée',
            livree: 'Livrée',
            cancelled: 'Annulée',
        };

        await this.create({
            userId,
            type: 'order_status_change',
            title: `Commande #${orderNumber}`,
            body: `Statut: ${statusLabels[status] || status}`,
            channel: 'in_app',
        });

        // Email notification
        if (email) {
            await sendOrderStatusEmail(email, orderNumber, status);
        }
    }

    /**
     * Notify user of a new chat message
     */
    static async notifyNewMessage(
        recipientId: string,
        senderName: string,
        orderNumber: string
    ) {
        await this.create({
            userId: recipientId,
            type: 'new_message',
            title: 'Nouveau message',
            body: `${senderName} vous a envoyé un message (commande #${orderNumber})`,
            channel: 'in_app',
        });
    }

    /**
     * Get user notifications (paginated)
     */
    static async getUserNotifications(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where: { userId } }),
        ]);

        return { notifications, total, page, totalPages: Math.ceil(total / limit) };
    }

    /**
     * Get unread count
     */
    static async getUnreadCount(userId: string): Promise<number> {
        return prisma.notification.count({
            where: { userId, isRead: false },
        });
    }

    /**
     * Mark notifications as read
     */
    static async markAsRead(userId: string, notificationIds?: string[]) {
        const where: any = { userId };
        if (notificationIds && notificationIds.length > 0) {
            where.id = { in: notificationIds };
        }
        await prisma.notification.updateMany({
            where,
            data: { isRead: true },
        });
    }
}
