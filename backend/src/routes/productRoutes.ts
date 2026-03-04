import { Router } from 'express';
import { ProductController } from '@controllers/productController';
import { authenticateToken, authorizeAdmin } from '@middleware/auth';

const router = Router();

// Public routes
router.get('/', ProductController.getAllProducts);
router.get('/:slug', ProductController.getProductBySlug);

// Admin only routes
router.post('/', authenticateToken, authorizeAdmin, ProductController.createProduct);
router.put('/:id', authenticateToken, authorizeAdmin, ProductController.updateProduct);
router.delete('/:id', authenticateToken, authorizeAdmin, ProductController.deleteProduct);
router.post('/:id/images', authenticateToken, authorizeAdmin, ProductController.addProductImage);

export default router;
