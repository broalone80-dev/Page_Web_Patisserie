import { Router } from 'express';
import { PaymentController } from '@controllers/paymentController';
import { authenticateToken } from '@middleware/auth';

const router = Router();

// ─── Authenticated routes ───────────────────────
router.post('/mobile/initiate', authenticateToken, PaymentController.initiatePayment);
router.get('/mobile/status/:paymentId', authenticateToken, PaymentController.checkStatus);
router.post('/manual/confirm', authenticateToken, PaymentController.confirmManualPayment);
router.get('/:orderId', authenticateToken, PaymentController.getPayment);

// ─── Webhooks (NO auth - signature verified in handler) ─
router.post('/mobile/webhook/orange', PaymentController.orangeWebhook);
router.post('/mobile/webhook/mtn', PaymentController.mtnWebhook);

export default router;
