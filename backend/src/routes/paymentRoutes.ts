import { Router } from 'express';
import { PaymentController } from '@controllers/paymentController';
import { authenticateToken } from '@middleware/auth';

const router = Router();

// All payment routes require authentication
router.use(authenticateToken);

// Initiate payment
router.post('/initiate', PaymentController.initiatePayment);

// Get payment details
router.get('/:orderId', PaymentController.getPayment);

// Callbacks (no auth needed - must be added at app level)
// router.get('/callback/flutterwave', PaymentController.flutterwaveCallback);
// router.get('/callback/cinetpay', PaymentController.cinetpayCallback);

// Webhooks (no auth needed - must be added at app level)
// router.post('/webhook/flutterwave', PaymentController.flutterwaveWebhook);
// router.post('/webhook/cinetpay', PaymentController.cinetpayWebhook);

export default router;
