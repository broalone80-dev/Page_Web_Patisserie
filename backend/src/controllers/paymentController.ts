import { Request, Response } from 'express';
import prisma from '@config/database';
import { MobileMoneyService } from '@services/mobileMoneyService';
import { sendSuccess, sendError } from '@utils/responses';
import { AuthRequest } from '../types/index';

export class PaymentController {
  /**
   * POST /api/payments/mobile/initiate
   * Initiate Mobile Money payment (Orange Money / MTN MoMo)
   */
  static async initiatePayment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) { sendError(res, 401, 'Non authentifié'); return; }

      const { orderId, provider, phone } = req.body;

      // Validate provider
      if (!['orange_money', 'mtn_momo'].includes(provider)) {
        sendError(res, 400, 'Fournisseur invalide. Utilisez orange_money ou mtn_momo.');
        return;
      }

      if (!phone) {
        sendError(res, 400, 'Numéro de téléphone requis');
        return;
      }

      if (!orderId) {
        sendError(res, 400, 'ID commande requis');
        return;
      }

      // Anti-fraud: rate limit (max 5 payment attempts per user in 30 min)
      const recentAttempts = await prisma.paymentAttempt.count({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
        },
      });

      if (recentAttempts >= 5) {
        await prisma.fraudLog.create({
          data: {
            userId,
            orderId,
            action: 'rate_exceeded',
            details: { attempts: recentAttempts },
            ipAddress: req.ip,
            severity: 'high',
          },
        });
        sendError(res, 429, 'Trop de tentatives. Réessayez dans 30 minutes.');
        return;
      }

      const result = await MobileMoneyService.initiatePayment({
        orderId,
        provider,
        phone,
        userId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      sendSuccess(res, 200, result.message, {
        paymentId: result.paymentId,
        status: result.status,
      });
    } catch (error: any) {
      console.error('[PaymentController] initiate error:', error.message);
      sendError(res, 400, error.message || 'Échec de la demande de paiement');
    }
  }

  /**
   * GET /api/payments/mobile/status/:paymentId
   * Poll payment status (for weak network / mobile-first)
   */
  static async checkStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) { sendError(res, 401, 'Non authentifié'); return; }

      const { paymentId } = req.params;

      // Ownership check: verify payment belongs to user's order
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: { select: { userId: true } } },
      });

      if (!payment) {
        sendError(res, 404, 'Paiement introuvable');
        return;
      }

      // Only owner, admin, or manager can check
      if (payment.order?.userId !== userId && !req.user?.isAdmin && !req.user?.isManager) {
        sendError(res, 403, 'Non autorisé');
        return;
      }

      const status = await MobileMoneyService.checkPaymentStatus(paymentId);

      sendSuccess(res, 200, status.message, {
        paymentId,
        status: status.status,
      });
    } catch (error: any) {
      sendError(res, 500, 'Erreur vérification paiement');
    }
  }

  /**
   * POST /api/payments/mobile/webhook/orange
   * Orange Money webhook (no auth - signature verified internally)
   */
  static async orangeWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-webhook-signature'] as string ||
                        req.headers['authorization'] as string;

      const result = await MobileMoneyService.processWebhook('orange_money', req.body, signature);

      if (result.processed) {
        res.status(200).json({ status: 'OK' });
      } else {
        res.status(200).json({ status: 'IGNORED' });
      }
    } catch (error: any) {
      console.error('[Webhook] Orange error:', error.message);
      // Always return 200 to webhooks to prevent retries on our errors
      res.status(200).json({ status: 'ERROR' });
    }
  }

  /**
   * POST /api/payments/mobile/webhook/mtn
   * MTN MoMo webhook (no auth - signature verified internally)
   */
  static async mtnWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-webhook-signature'] as string;

      const result = await MobileMoneyService.processWebhook('mtn_momo', req.body, signature);

      if (result.processed) {
        res.status(200).json({ status: 'OK' });
      } else {
        res.status(200).json({ status: 'IGNORED' });
      }
    } catch (error: any) {
      console.error('[Webhook] MTN error:', error.message);
      res.status(200).json({ status: 'ERROR' });
    }
  }

  /**
   * POST /api/payments/manual/confirm
   * Admin/Manager: Confirm a manual payment
   */
  static async confirmManualPayment(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.isAdmin && !req.user?.isManager) {
        sendError(res, 403, 'Réservé aux gestionnaires');
        return;
      }

      const { paymentId } = req.body;
      if (!paymentId) {
        sendError(res, 400, 'ID paiement requis');
        return;
      }

      await MobileMoneyService.confirmManualPayment(paymentId, req.user.id);

      sendSuccess(res, 200, 'Paiement confirmé avec succès');
    } catch (error: any) {
      sendError(res, 400, error.message || 'Échec confirmation');
    }
  }

  /**
   * GET /api/payments/:orderId
   * Get payment details for an order (with ownership check)
   */
  static async getPayment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) { sendError(res, 401, 'Non authentifié'); return; }

      const { orderId } = req.params;

      // Ownership: find order first
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { userId: true },
      });

      if (!order) {
        sendError(res, 404, 'Commande introuvable');
        return;
      }

      // Only owner, admin, or manager
      if (order.userId !== userId && !req.user?.isAdmin && !req.user?.isManager) {
        sendError(res, 403, 'Non autorisé');
        return;
      }

      const payment = await prisma.payment.findFirst({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          provider: true,
          status: true,
          amountCents: true,
          currency: true,
          paymentPhone: true,
          webhookVerified: true,
          completedAt: true,
          createdAt: true,
          failureReason: true,
        },
      });

      if (!payment) {
        sendError(res, 404, 'Aucun paiement trouvé');
        return;
      }

      sendSuccess(res, 200, 'Détails du paiement', payment);
    } catch (error) {
      sendError(res, 500, 'Erreur récupération paiement');
    }
  }
}
