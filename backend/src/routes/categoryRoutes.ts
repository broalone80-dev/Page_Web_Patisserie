import { Router } from 'express';
import { CategoryController } from '@controllers/categoryController';
import { authenticateToken, authorizeAdmin } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { categorySchema, updateCategorySchema } from '@validators/chatValidators';

const router = Router();

// Public routes
router.get('/', CategoryController.getAll);
router.get('/:slug', CategoryController.getBySlug);

// Admin routes
router.post('/', authenticateToken, authorizeAdmin, validate(categorySchema), CategoryController.create);
router.put('/:id', authenticateToken, authorizeAdmin, validate(updateCategorySchema), CategoryController.update);
router.delete('/:id', authenticateToken, authorizeAdmin, CategoryController.delete);

export default router;
