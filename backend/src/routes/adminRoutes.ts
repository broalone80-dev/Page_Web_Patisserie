import { Router } from 'express';
import { AdminController } from '@controllers/adminController';
import { authenticateToken, authorizeAdmin } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { updateOrderStatusSchema } from '@validators/orderValidators';
import { createProductSchema, updateProductSchema } from '@validators/productValidators';

const router = Router();

// All admin routes require admin authentication
router.use(authenticateToken, authorizeAdmin);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// Users
router.get('/users', AdminController.getUsers);
router.put('/users/:id/toggle-status', AdminController.toggleUserStatus);

// Orders
router.get('/orders', AdminController.getOrders);
router.put('/orders/:id/status', validate(updateOrderStatusSchema), AdminController.updateOrderStatus);

// Products (admin CRUD)
router.post('/products', validate(createProductSchema), AdminController.createProduct);
router.put('/products/:id', validate(updateProductSchema), AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);
router.post('/products/:id/images', AdminController.addProductImages);

export default router;
