import { Request, Response, NextFunction } from 'express';
import { ChatService } from '@services/chatService';
import { sendSuccess, sendError } from '@utils/responses';

/**
 * Chat Controller – Order-based messaging
 */
export class ChatController {
    /**
     * Send a message in an order thread
     */
    static async sendMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;
            const userId = (req as any).user?.id;
            const { content } = req.body;

            const message = await ChatService.sendMessage(orderId, userId, content);
            sendSuccess(res, 201, 'Message envoyé', { message });
        } catch (error: any) {
            if (error.message === 'Commande introuvable') {
                sendError(res, 404, error.message);
            } else if (error.message === 'Accès non autorisé') {
                sendError(res, 403, error.message);
            } else {
                next(error);
            }
        }
    }

    /**
     * Get messages for an order
     */
    static async getMessages(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const result = await ChatService.getOrderMessages(orderId, page, limit);
            sendSuccess(res, 200, 'Messages récupérés', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark messages as read
     */
    static async markAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;
            const userId = (req as any).user?.id;

            await ChatService.markAsRead(orderId, userId);
            sendSuccess(res, 200, 'Messages marqués comme lus');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get unread message counts
     */
    static async getUnreadCounts(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            const counts = await ChatService.getUnreadCounts(userId);
            sendSuccess(res, 200, 'Compteurs récupérés', { counts });
        } catch (error) {
            next(error);
        }
    }
}
