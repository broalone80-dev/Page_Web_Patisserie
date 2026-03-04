import { Router } from 'express';
import { NotificationController } from '@controllers/notificationController';
import { authenticateToken } from '@middleware/auth';

const router = Router();

// All notification routes require authentication
router.use(authenticateToken);

router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.put('/read', NotificationController.markAsRead);

export default router;
