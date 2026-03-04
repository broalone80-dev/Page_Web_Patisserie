import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '@services/notificationService';
import { sendSuccess } from '@utils/responses';

/**
 * Notification Controller
 */
export class NotificationController {
    /**
     * Get user notifications
     */
    static async getNotifications(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await NotificationService.getUserNotifications(userId, page, limit);
            sendSuccess(res, 200, 'Notifications récupérées', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get unread count
     */
    static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            const count = await NotificationService.getUnreadCount(userId);
            sendSuccess(res, 200, 'Compteur récupéré', { unreadCount: count });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark notifications as read
     */
    static async markAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            const { notificationIds } = req.body;

            await NotificationService.markAsRead(userId, notificationIds);
            sendSuccess(res, 200, 'Notifications marquées comme lues');
        } catch (error) {
            next(error);
        }
    }
}
