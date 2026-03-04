import { Router } from 'express';
import { UploadController, upload } from '@controllers/uploadController';
import { authenticateToken, authorizeAdmin } from '@middleware/auth';

const router = Router();

// All upload routes require admin authentication
router.use(authenticateToken, authorizeAdmin);

router.post('/single', upload.single('image'), UploadController.uploadSingle);
router.post('/multiple', upload.array('images', 5), UploadController.uploadMultiple);
router.delete('/:publicId', UploadController.deleteImage);

export default router;
