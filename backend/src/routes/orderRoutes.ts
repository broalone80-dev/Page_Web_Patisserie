import { Router } from 'express';
import { OrderController } from '@controllers/orderController';
import { authenticateToken } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { createOrderSchema } from '@validators/orderValidators';

const router = Router();

// All order routes require authentication
router.use(authenticateToken);

router.post('/', validate(createOrderSchema), OrderController.createOrder);
router.get('/', OrderController.getUserOrders);
router.get('/:id', OrderController.getOrderById);

export default router;
