import { Request, Response } from 'express';
import prisma from '@config/database';
import { PaymentService } from '@services/paymentService';
import { sendSuccess, sendError } from '@utils/responses';
import { ApiError } from '@utils/errors';
import crypto from 'crypto';

export class PaymentController {
  /**
   * POST /api/payments/initiate
   * Initiate payment for an order
   */
  static async initiatePayment(req: Request, res: Response) {
    try {
      const { orderId, provider } = req.body;

      if (!['flutterwave', 'cinetpay'].includes(provider)) {
        sendError(res, 400, 'Invalid payment provider');
        return;
      }

      // Get order details
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          items: true,
        },
      });

      if (!order) {
        sendError(res, 404, 'Order not found');
        return;
      }

      if (order.status !== 'pending') {
        sendError(res, 400, 'Order status does not allow payment');
        return;
      }

      // Create payment
      let paymentResult;
      if (provider === 'flutterwave') {
        paymentResult = await PaymentService.createFlutterwavePayment(
          orderId,
          order.totalCents,
          order.user?.email || '',
          order.user?.fullName || 'Customer'
        );
      } else {
        paymentResult = await PaymentService.createCinetpayPayment(
          orderId,
          order.totalCents,
          order.user?.email || '',
          order.user?.fullName || 'Customer'
        );
      }

      // Store payment record
      await prisma.payment.create({
        data: {
          orderId,
          provider,
          providerPaymentId: paymentResult.reference,
          amountCents: order.totalCents,
          status: 'initiated',
        },
      });

      sendSuccess(res, 200, {
        paymentLink: paymentResult.paymentLink,
        provider,
      }, 'Payment link generated');
    } catch (error) {
      console.error('Payment initiation failed:', error);
      sendError(res, 500, 'Failed to initiate payment');
    }
  }

  /**
   * GET /api/payments/callback/flutterwave
   * Flutterwave payment callback
   */
  static async flutterwaveCallback(req: Request, res: Response) {
    try {
      const { status, tx_ref } = req.query;

      // Extract order ID from tx_ref (format: ORD-{orderId})
      const orderId = (tx_ref as string)?.replace('ORD-', '');

      if (!orderId) {
        res.status(400).json({ error: 'Invalid transaction reference' });
        return;
      }

      // Get latest payment for this order
      const payment = await prisma.payment.findFirst({
        where: { orderId, provider: 'flutterwave' },
        orderBy: { createdAt: 'desc' },
      });

      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      // Verify payment status with Flutterwave
      if (payment.providerPaymentId) {
        try {
          const verification = await PaymentService.verifyFlutterwavePayment(
            payment.providerPaymentId
          );

          // Update payment and order status
          if (verification.status === 'completed') {
            await prisma.$transaction([
              prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'successful' },
              }),
              prisma.order.update({
                where: { id: orderId },
                data: { status: 'paid', paymentStatus: 'successful' },
              }),
            ]);

            res.redirect(`${process.env.FRONTEND_URL}/orders/${orderId}?status=success`);
            return;
          }
        } catch (error) {
          console.error('Flutterwave verification failed:', error);
        }
      }

      res.redirect(`${process.env.FRONTEND_URL}/orders/${orderId}?status=failed`);
    } catch (error) {
      console.error('Flutterwave callback error:', error);
      res.status(500).json({ error: 'Callback processing failed' });
    }
  }

  /**
   * GET /api/payments/callback/cinetpay
   * CinetPay payment callback
   */
  static async cinetpayCallback(req: Request, res: Response) {
    try {
      const { payment_token } = req.query;

      if (!payment_token) {
        res.status(400).json({ error: 'Invalid payment token' });
        return;
      }

      // Find payment by token
      const payment = await prisma.payment.findFirst({
        where: { providerPaymentId: payment_token as string },
      });

      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      // Verify payment with CinetPay
      try {
        const verification = await PaymentService.verifyCinetpayPayment(payment_token as string);

        if (verification.status === 'completed') {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'successful' },
            }),
            prisma.order.update({
              where: { id: payment.orderId },
              data: { status: 'paid', paymentStatus: 'successful' },
            }),
          ]);

          res.redirect(
            `${process.env.FRONTEND_URL}/orders/${payment.orderId}?status=success`
          );
          return;
        }
      } catch (error) {
        console.error('CinetPay verification failed:', error);
      }

      res.redirect(`${process.env.FRONTEND_URL}/orders/${payment.orderId}?status=failed`);
    } catch (error) {
      console.error('CinetPay callback error:', error);
      res.status(500).json({ error: 'Callback processing failed' });
    }
  }

  /**
   * POST /api/payments/webhook/flutterwave
   * Flutterwave webhook handler
   */
  static async flutterwaveWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['verif-hash'] as string;
      const hash = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');

      // Verify webhook signature
      if (signature !== hash) {
        sendError(res, 401, 'Invalid webhook signature');
        return;
      }

      const { event, data } = req.body;

      if (event === 'charge.completed') {
        const txRef = data.tx_ref; // ORD-{orderId}
        const orderId = txRef.replace('ORD-', '');

        // Update payment and order
        const payment = await prisma.payment.findFirst({
          where: { orderId, provider: 'flutterwave' },
          orderBy: { createdAt: 'desc' },
        });

        if (payment) {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'successful', metadata: { webhookData: data } },
            }),
            prisma.order.update({
              where: { id: orderId },
              data: { status: 'paid', paymentStatus: 'successful' },
            }),
          ]);
        }
      }

      sendSuccess(res, 200, null, 'Webhook processed');
    } catch (error) {
      console.error('Flutterwave webhook error:', error);
      sendError(res, 500, 'Webhook processing failed');
    }
  }

  /**
   * POST /api/payments/webhook/cinetpay
   * CinetPay webhook handler
   */
  static async cinetpayWebhook(req: Request, res: Response) {
    try {
      const { status, payment_id, payment_token } = req.body;

      if (status === 'accepted') {
        const payment = await prisma.payment.findFirst({
          where: { providerPaymentId: payment_token },
        });

        if (payment) {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'successful', metadata: { paymentId: payment_id } },
            }),
            prisma.order.update({
              where: { id: payment.orderId },
              data: { status: 'paid', paymentStatus: 'successful' },
            }),
          ]);
        }
      }

      sendSuccess(res, 200, null, 'Webhook processed');
    } catch (error) {
      console.error('CinetPay webhook error:', error);
      sendError(res, 500, 'Webhook processing failed');
    }
  }

  /**
   * GET /api/payments/:orderId
   * Get payment details for order
   */
  static async getPayment(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      const payment = await prisma.payment.findFirst({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
      });

      if (!payment) {
        sendError(res, 404, 'Payment not found');
        return;
      }

      sendSuccess(res, 200, payment);
    } catch (error) {
      sendError(res, 500, 'Failed to fetch payment');
    }
  }
}
