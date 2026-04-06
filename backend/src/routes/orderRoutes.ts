import { Router } from 'express';
import { OrderController } from '@controllers/orderController';
import { authenticateToken, authorizeManager } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { createOrderSchema, updateOrderStatusSchema, validateDeliverySchema } from '@validators/orderValidators';

const router = Router();

// All order routes require authentication
router.use(authenticateToken);

// Delivery fee calculator (public for authenticated users)
router.get('/delivery-fee', OrderController.getDeliveryFee);

// Manager routes (MUST be before /:id to avoid route shadowing)
router.get('/manager/dashboard', authorizeManager, OrderController.getManagerDashboard);
router.get('/manager/orders', authorizeManager, OrderController.getManagerOrders);
router.patch('/:id/status', authorizeManager, validate(updateOrderStatusSchema), OrderController.updateOrderStatus);
router.post('/:id/validate-delivery', authorizeManager, validate(validateDeliverySchema), OrderController.validateDelivery);

// Client routes
router.post('/', validate(createOrderSchema), OrderController.createOrder);
router.get('/', OrderController.getUserOrders);
router.get('/:id', OrderController.getOrderById);
router.get('/:id/timeline', OrderController.getOrderTimeline);
router.get('/:id/delivery-code', OrderController.getDeliveryCode);

export default router;
