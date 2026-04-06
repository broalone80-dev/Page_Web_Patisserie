import axios from 'axios';
import crypto from 'crypto';
import prisma from '@config/database';
import { config } from '@config/env';
import { emitToUser } from '@config/websocket';

// ============================================
// TYPES
// ============================================

export type MobileMoneyProvider = 'orange_money' | 'mtn_momo';
export type PaymentStatus = 'initiated' | 'pending' | 'processing' | 'successful' | 'failed' | 'cancelled';

interface InitiatePaymentParams {
  orderId: string;
  provider: MobileMoneyProvider;
  phone: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

interface PaymentResult {
  paymentId: string;
  status: PaymentStatus;
  providerRef?: string;
  message: string;
}

// ============================================
// MOBILE MONEY SERVICE — Cameroon-specific
// ============================================

export class MobileMoneyService {
  // ─── INITIATE PAYMENT ─────────────────────────
  static async initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult> {
    const { orderId, provider, phone, userId, ipAddress, userAgent } = params;

    // 1. Validate phone format for Cameroon
    const cleanPhone = this.normalizePhone(phone);
    if (!cleanPhone) {
      throw new Error('Numéro de téléphone invalide');
    }

    // 2. Verify phone matches provider
    if (provider === 'orange_money' && !this.isOrangeNumber(cleanPhone)) {
      throw new Error('Ce numéro n\'est pas un numéro Orange');
    }
    if (provider === 'mtn_momo' && !this.isMTNNumber(cleanPhone)) {
      throw new Error('Ce numéro n\'est pas un numéro MTN');
    }

    // 3. Anti-fraud: check for duplicate/rapid payments
    const recentPayment = await prisma.payment.findFirst({
      where: {
        orderId,
        status: { in: ['initiated', 'pending', 'processing'] },
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // 5 min window
      },
    });

    if (recentPayment) {
      // Return existing pending payment instead of creating duplicate
      return {
        paymentId: recentPayment.id,
        status: recentPayment.status as PaymentStatus,
        message: 'Paiement déjà en cours. Vérifiez votre téléphone.',
      };
    }

    // 4. Verify order server-side (amount comes from DB, not client)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, totalCents: true, status: true, paymentStatus: true },
    });

    if (!order) throw new Error('Commande introuvable');
    if (order.userId !== userId) throw new Error('Commande non autorisée');
    if (order.paymentStatus === 'successful') throw new Error('Commande déjà payée');

    // Use server-side amount (never trust client)
    const amountCents = order.totalCents;

    // 5. Generate idempotency key
    const idempotencyKey = `${orderId}-${provider}-${Date.now()}`;

    // 6. Log the attempt
    await prisma.paymentAttempt.create({
      data: {
        orderId,
        userId,
        provider,
        amountCents,
        phone: cleanPhone,
        ipAddress,
        userAgent,
        status: 'initiated',
      },
    });

    // 7. Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        provider,
        idempotencyKey,
        amountCents,
        currency: 'XAF',
        status: 'pending',
        paymentPhone: cleanPhone,
      },
    });

    // 8. Call the provider API
    try {
      let providerResult;

      if (provider === 'orange_money') {
        providerResult = await this.callOrangeMoneyAPI(payment.id, cleanPhone, amountCents, orderId);
      } else {
        providerResult = await this.callMTNMoMoAPI(payment.id, cleanPhone, amountCents, orderId);
      }

      // Update payment with provider reference
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: providerResult.providerRef,
          externalRef: providerResult.externalRef,
          status: 'processing',
        },
      });

      // Notify user: payment request sent to phone
      emitToUser(userId, 'payment_status', {
        orderId,
        paymentId: payment.id,
        status: 'processing',
        message: `Demande envoyée sur ${cleanPhone}. Validez avec votre PIN.`,
      });

      return {
        paymentId: payment.id,
        status: 'processing',
        providerRef: providerResult.providerRef,
        message: provider === 'orange_money'
          ? `Validez le paiement sur votre téléphone Orange (${cleanPhone})`
          : `Validez le paiement sur votre téléphone MTN (${cleanPhone})`,
      };
    } catch (error: any) {
      // Update payment as failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
          failureReason: error.message || 'Provider error',
        },
      });

      // Notify user of failure
      emitToUser(userId, 'payment_status', {
        orderId,
        paymentId: payment.id,
        status: 'failed',
        message: 'Échec de la demande de paiement. Réessayez.',
      });

      throw new Error(
        `Échec ${provider === 'orange_money' ? 'Orange Money' : 'MTN MoMo'}: ${error.message || 'Service indisponible'}`
      );
    }
  }

  // ─── ORANGE MONEY API ─────────────────────────
  private static async callOrangeMoneyAPI(
    paymentId: string,
    phone: string,
    amountCents: number,
    orderId: string
  ) {
    const amount = amountCents / 100;
    const { orangeApiUrl, orangeApiKey, orangeMerchantKey } = config.payment;

    // If no API keys configured → fallback to manual mode
    if (!orangeApiKey || !orangeMerchantKey) {
      return this.manualFallback(paymentId, 'orange_money', phone, amountCents, orderId);
    }

    try {
      // Step 1: Get access token
      const tokenRes = await axios.post(
        'https://api.orange.com/oauth/v3/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${config.payment.orangeClientId}:${config.payment.orangeClientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 15000,
        }
      );
      const accessToken = tokenRes.data.access_token;

      // Step 2: Initiate payment (push to phone)
      const payRes = await axios.post(
        `${orangeApiUrl}/webpayment`,
        {
          merchant_key: orangeMerchantKey,
          currency: 'OUV', // Orange internal currency code for XAF
          order_id: orderId.slice(0, 36),
          amount,
          return_url: `${config.server.apiBaseUrl}/api/payments/mobile/callback/orange`,
          cancel_url: `${config.server.frontendUrl}/orders/${orderId}?status=cancelled`,
          notif_url: `${config.server.apiBaseUrl}/api/payments/mobile/webhook/orange`,
          lang: 'fr',
          reference: paymentId,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return {
        providerRef: payRes.data.pay_token || payRes.data.payment_url,
        externalRef: payRes.data.notif_token || '',
      };
    } catch (error: any) {
      console.error('[OrangeMoney] API error:', error.response?.data || error.message);
      // Fallback to manual mode
      return this.manualFallback(paymentId, 'orange_money', phone, amountCents, orderId);
    }
  }

  // ─── MTN MOMO API ─────────────────────────
  private static async callMTNMoMoAPI(
    paymentId: string,
    phone: string,
    amountCents: number,
    orderId: string
  ) {
    const amount = amountCents / 100;
    const { mtnApiUrl, mtnApiKey, mtnApiUserId, mtnSubscriptionKey, mtnEnvironment } = config.payment;

    // If no API keys configured → fallback to manual mode
    if (!mtnApiKey || !mtnSubscriptionKey) {
      return this.manualFallback(paymentId, 'mtn_momo', phone, amountCents, orderId);
    }

    try {
      // Step 1: Get access token
      const credentials = Buffer.from(`${mtnApiUserId}:${mtnApiKey}`).toString('base64');
      const tokenRes = await axios.post(
        `${mtnApiUrl}/collection/token/`,
        {},
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Ocp-Apim-Subscription-Key': mtnSubscriptionKey,
          },
          timeout: 15000,
        }
      );
      const accessToken = tokenRes.data.access_token;

      // Step 2: Request to pay (push USSD prompt to phone)
      const referenceId = crypto.randomUUID();
      await axios.post(
        `${mtnApiUrl}/collection/v1_0/requesttopay`,
        {
          amount: amount.toString(),
          currency: 'XAF',
          externalId: paymentId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: phone.startsWith('237') ? phone : `237${phone}`,
          },
          payerMessage: `Paiement GuiGui - ${amount} FCFA`,
          payeeNote: `Commande ${orderId.slice(0, 8)}`,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Reference-Id': referenceId,
            'X-Target-Environment': mtnEnvironment,
            'Ocp-Apim-Subscription-Key': mtnSubscriptionKey,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return {
        providerRef: referenceId,
        externalRef: referenceId,
      };
    } catch (error: any) {
      console.error('[MTNMoMo] API error:', error.response?.data || error.message);
      // Fallback to manual mode
      return this.manualFallback(paymentId, 'mtn_momo', phone, amountCents, orderId);
    }
  }

  // ─── MANUAL FALLBACK MODE ─────────────────────
  // Used when API is unavailable (common in Cameroon)
  private static async manualFallback(
    paymentId: string,
    provider: MobileMoneyProvider,
    phone: string,
    amountCents: number,
    orderId: string
  ) {
    const manualRef = `MANUAL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create a manual payment with pending_confirmation status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        providerPaymentId: manualRef,
        status: 'pending',
        metadata: {
          mode: 'manual',
          instructions: provider === 'orange_money'
            ? `Composez #150*1*1# et envoyez ${amountCents / 100} FCFA`
            : `Composez *126# et envoyez ${amountCents / 100} FCFA`,
          phone,
        },
      },
    });

    // Notify managers for manual confirmation
    const managers = await prisma.user.findMany({
      where: { OR: [{ isAdmin: true }, { isManager: true }], isActive: true },
      select: { id: true },
    });

    for (const mgr of managers) {
      await prisma.notification.create({
        data: {
          userId: mgr.id,
          type: 'payment_manual',
          title: '💰 Paiement à confirmer',
          body: `Commande ${orderId.slice(0, 8)} - ${amountCents / 100} FCFA via ${provider === 'orange_money' ? 'Orange Money' : 'MTN MoMo'} (${phone})`,
          channel: 'in_app',
          status: 'sent',
          metadata: { orderId, paymentId, provider, phone, amountCents },
        },
      });
      emitToUser(mgr.id, 'notification', {
        type: 'payment_manual',
        title: '💰 Paiement à confirmer',
        orderId,
      });
    }

    return {
      providerRef: manualRef,
      externalRef: manualRef,
    };
  }

  // ─── CHECK PAYMENT STATUS ─────────────────────
  static async checkPaymentStatus(paymentId: string): Promise<{
    status: PaymentStatus;
    message: string;
  }> {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error('Paiement introuvable');

    // If already finalized, return immediately
    if (['successful', 'failed', 'cancelled'].includes(payment.status)) {
      return {
        status: payment.status as PaymentStatus,
        message: this.getStatusMessage(payment.status, payment.provider),
      };
    }

    // Check with provider if we have a reference
    if (payment.providerPaymentId && !payment.providerPaymentId.startsWith('MANUAL-')) {
      try {
        if (payment.provider === 'mtn_momo') {
          return await this.checkMTNStatus(payment);
        }
        if (payment.provider === 'orange_money') {
          return await this.checkOrangeStatus(payment);
        }
      } catch {
        // Provider check failed, return current status
      }
    }

    return {
      status: payment.status as PaymentStatus,
      message: this.getStatusMessage(payment.status, payment.provider),
    };
  }

  // ─── CHECK MTN STATUS ─────────────────────
  private static async checkMTNStatus(payment: any) {
    const { mtnApiUrl, mtnApiKey, mtnApiUserId, mtnSubscriptionKey, mtnEnvironment } = config.payment;

    try {
      const credentials = Buffer.from(`${mtnApiUserId}:${mtnApiKey}`).toString('base64');
      const tokenRes = await axios.post(`${mtnApiUrl}/collection/token/`, {}, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Ocp-Apim-Subscription-Key': mtnSubscriptionKey,
        },
        timeout: 10000,
      });

      const res = await axios.get(
        `${mtnApiUrl}/collection/v1_0/requesttopay/${payment.providerPaymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${tokenRes.data.access_token}`,
            'X-Target-Environment': mtnEnvironment,
            'Ocp-Apim-Subscription-Key': mtnSubscriptionKey,
          },
          timeout: 10000,
        }
      );

      const mtnStatus = res.data.status; // SUCCESSFUL, FAILED, PENDING
      let newStatus: PaymentStatus = 'processing';

      if (mtnStatus === 'SUCCESSFUL') newStatus = 'successful';
      else if (mtnStatus === 'FAILED') newStatus = 'failed';

      if (newStatus !== payment.status) {
        await this.finalizePayment(payment.id, newStatus, res.data.financialTransactionId);
      }

      return {
        status: newStatus,
        message: this.getStatusMessage(newStatus, 'mtn_momo'),
      };
    } catch {
      return { status: payment.status as PaymentStatus, message: 'Vérification en cours...' };
    }
  }

  // ─── CHECK ORANGE STATUS ─────────────────────
  private static async checkOrangeStatus(payment: any) {
    // Orange Money uses webhooks primarily; polling is limited
    return {
      status: payment.status as PaymentStatus,
      message: this.getStatusMessage(payment.status, 'orange_money'),
    };
  }

  // ─── PROCESS WEBHOOK ─────────────────────────
  static async processWebhook(
    provider: MobileMoneyProvider,
    body: any,
    signature?: string
  ): Promise<{ processed: boolean; orderId?: string }> {
    const isProd = process.env.NODE_ENV === 'production';

    // 1. REQUIRE webhook signature in production
    if (isProd && !config.payment.webhookSecret) {
      console.error('[Webhook] CRITICAL: PAYMENT_WEBHOOK_SECRET not configured in production!');
      throw new Error('Webhook security not configured');
    }

    if (config.payment.webhookSecret) {
      if (!signature) {
        await prisma.fraudLog.create({
          data: {
            action: 'missing_webhook_signature',
            details: { provider },
            severity: 'critical',
          },
        });
        throw new Error('Missing webhook signature');
      }

      const expectedSig = crypto
        .createHmac('sha256', config.payment.webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      // Constant-time comparison to prevent timing attacks
      if (signature.length !== expectedSig.length ||
          !crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expectedSig, 'utf8'))) {
        await prisma.fraudLog.create({
          data: {
            action: 'invalid_webhook',
            details: { provider, signature: signature?.slice(0, 20) },
            severity: 'critical',
          },
        });
        throw new Error('Invalid webhook signature');
      }
    }

    // 2. Extract payment reference based on provider
    let paymentRef: string | null = null;
    let isSuccess = false;

    if (provider === 'orange_money') {
      paymentRef = body.notif_token || body.pay_token || body.reference;
      isSuccess = body.status === 'SUCCESS' || body.status === 'SUCCESSFULL';
    } else if (provider === 'mtn_momo') {
      paymentRef = body.externalId || body.referenceId;
      isSuccess = body.status === 'SUCCESSFUL';
    }

    if (!paymentRef) {
      return { processed: false };
    }

    // 3. Find the payment
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { providerPaymentId: paymentRef },
          { externalRef: paymentRef },
          { id: paymentRef },
        ],
      },
    });

    if (!payment) return { processed: false };

    // 4. Prevent duplicate processing (idempotent)
    if (payment.status === 'successful') {
      return { processed: true, orderId: payment.orderId };
    }

    // 5. Finalize
    const newStatus: PaymentStatus = isSuccess ? 'successful' : 'failed';
    await this.finalizePayment(payment.id, newStatus, body.financialTransactionId || body.txnId);

    return { processed: true, orderId: payment.orderId };
  }

  // ─── FINALIZE PAYMENT ─────────────────────────
  static async finalizePayment(paymentId: string, status: PaymentStatus, externalRef?: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { select: { id: true, userId: true, orderNumber: true } } },
    });

    if (!payment) return;

    // Atomic transaction: update payment + order
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status,
          externalRef: externalRef || payment.externalRef,
          webhookVerified: true,
          completedAt: status === 'successful' ? new Date() : undefined,
        },
      }),
      ...(status === 'successful'
        ? [
            prisma.order.update({
              where: { id: payment.orderId },
              data: { paymentStatus: 'successful' },
            }),
          ]
        : []),
    ]);

    // Real-time notification to user
    if (payment.order?.userId) {
      const msg =
        status === 'successful'
          ? `Paiement de ${payment.amountCents / 100} FCFA confirmé !`
          : `Échec du paiement. Réessayez.`;

      emitToUser(payment.order.userId, 'payment_status', {
        orderId: payment.orderId,
        paymentId: payment.id,
        status,
        message: msg,
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: payment.order.userId,
          type: status === 'successful' ? 'payment_success' : 'payment_failed',
          title: status === 'successful' ? '✅ Paiement confirmé' : '❌ Échec du paiement',
          body: msg,
          channel: 'in_app',
          status: 'sent',
          metadata: { orderId: payment.orderId, paymentId: payment.id },
        },
      });
    }
  }

  // ─── ADMIN: Confirm manual payment ─────────────
  static async confirmManualPayment(paymentId: string, confirmedById: string) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error('Paiement introuvable');
    if (payment.status === 'successful') throw new Error('Déjà confirmé');

    await this.finalizePayment(paymentId, 'successful');

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: confirmedById,
        action: 'manual_payment_confirmation',
        resource: 'payment',
        resourceId: paymentId,
        details: { orderId: payment.orderId, provider: payment.provider },
      },
    });
  }

  // ─── HELPERS ──────────────────────────────────

  static normalizePhone(phone: string): string | null {
    // Remove spaces, dashes, country code
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

    // Remove leading +237 or 237
    if (cleaned.startsWith('+237')) cleaned = cleaned.slice(4);
    else if (cleaned.startsWith('237') && cleaned.length > 9) cleaned = cleaned.slice(3);

    // Must be 9 digits starting with 6
    if (!/^6\d{8}$/.test(cleaned)) return null;

    return cleaned;
  }

  static isOrangeNumber(phone: string): boolean {
    // Orange Cameroun: 69X, 655-659
    return /^(69|655|656|657|658|659)\d{6,7}$/.test(phone);
  }

  static isMTNNumber(phone: string): boolean {
    // MTN Cameroun: 67X, 650-654, 680-689
    return /^(67|650|651|652|653|654|680|681|682|683|684|685|686|687|688|689)\d{6,7}$/.test(phone);
  }

  private static getStatusMessage(status: string, provider: string): string {
    const name = provider === 'orange_money' ? 'Orange Money' : 'MTN MoMo';
    switch (status) {
      case 'initiated': return 'Paiement initialisé...';
      case 'pending': return `En attente de validation ${name}`;
      case 'processing': return `Validez le paiement sur votre téléphone ${name}`;
      case 'successful': return 'Paiement confirmé !';
      case 'failed': return 'Le paiement a échoué. Réessayez.';
      case 'cancelled': return 'Paiement annulé.';
      default: return 'Statut inconnu';
    }
  }
}
