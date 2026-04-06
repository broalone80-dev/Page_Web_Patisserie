import prisma from '@config/database';
import bcryptjs from 'bcryptjs';
import { ApiError } from '@utils/errors';

/**
 * Delivery Service – OTP delivery code generation & validation
 * Adapted for Cameroon: no GPS, human livreurs, OTP-based confirmation
 */
export class DeliveryService {
  /**
   * Generate a 6-digit delivery code for an order
   * Code is hashed (bcrypt) before storage, plain code returned to client only
   */
  static async generateDeliveryCode(orderId: string): Promise<string> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new ApiError(404, 'Commande introuvable');

    // Delete any existing code for this order
    await prisma.deliveryCode.deleteMany({ where: { orderId } });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the code (for validation) + store plain (for client display)
    const codeHash = await bcryptjs.hash(code, 10);

    // Store with 24h expiry
    await prisma.deliveryCode.create({
      data: {
        orderId,
        codeHash,
        code,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return code;
  }

  /**
   * Validate delivery code (manager/livreur confirms delivery)
   * Returns true if valid, throws on invalid/expired/used
   */
  static async validateDeliveryCode(orderId: string, code: string): Promise<boolean> {
    const deliveryCode = await prisma.deliveryCode.findUnique({
      where: { orderId },
    });

    if (!deliveryCode) {
      throw new ApiError(404, 'Aucun code de livraison pour cette commande');
    }

    if (deliveryCode.isUsed) {
      throw new ApiError(400, 'Ce code a déjà été utilisé');
    }

    if (new Date() > deliveryCode.expiresAt) {
      throw new ApiError(400, 'Code expiré. Demandez un nouveau code au client.');
    }

    const isValid = await bcryptjs.compare(code, deliveryCode.codeHash);
    if (!isValid) {
      throw new ApiError(400, 'Code invalide');
    }

    // Mark as used
    await prisma.deliveryCode.update({
      where: { id: deliveryCode.id },
      data: { isUsed: true, usedAt: new Date() },
    });

    return true;
  }

  /**
   * Check if an order has an active delivery code
   */
  static async hasActiveCode(orderId: string): Promise<boolean> {
    const code = await prisma.deliveryCode.findUnique({
      where: { orderId },
    });
    if (!code) return false;
    return !code.isUsed && new Date() < code.expiresAt;
  }

  /**
   * Get the plain delivery code for the order owner
   */
  static async getPlainCode(orderId: string): Promise<string | null> {
    const record = await prisma.deliveryCode.findUnique({
      where: { orderId },
    });
    if (!record || record.isUsed || new Date() > record.expiresAt) return null;
    return record.code || null;
  }
}
