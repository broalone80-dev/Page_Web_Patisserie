import { Router } from 'express';
import { ChatController } from '@controllers/chatController';
import { authenticateToken } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { sendMessageSchema } from '@validators/chatValidators';

const router = Router();

// All chat routes require authentication
router.use(authenticateToken);

// Get unread message counts across all orders
router.get('/unread', ChatController.getUnreadCounts);

// Order-specific chat
router.get('/:orderId/messages', ChatController.getMessages);
router.post('/:orderId/messages', validate(sendMessageSchema), ChatController.sendMessage);
router.put('/:orderId/read', ChatController.markAsRead);

export default router;
