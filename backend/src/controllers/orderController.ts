import { Request, Response, NextFunction } from 'express';
import prisma from '@config/database';
import { sendSuccess, sendError } from '@utils/responses';
import { NotificationService } from '@services/notificationService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Order Controller – Create, list, and get order details
 */
export class OrderController {
  /**
   * Create a new order
   */
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { items, fulfillment, addressId, notes } = req.body;

      // Validate products and calculate totals
      const productIds = items.map((i: any) => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        include: { images: { take: 1, orderBy: { position: 'asc' } } },
      });

      if (products.length !== items.length) {
        sendError(res, 400, 'Certains produits sont indisponibles');
        return;
      }

      // Build order items with snapshots
      let subtotalCents = 0;
      const orderItems = items.map((item: { productId: string; quantity: number }) => {
        const product = products.find((p: any) => p.id === item.productId);
        if (!product) throw new Error('Product not found');

        // Check stock
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuffisant pour ${product.name}`);
        }

        const totalCents = product.priceCents * item.quantity;
        subtotalCents += totalCents;

        return {
          productId: item.productId,
          productSnapshot: {
            name: product.name,
            priceCents: product.priceCents,
            image: product.images[0]?.url || null,
          },
          quantity: item.quantity,
          unitPriceCents: product.priceCents,
          totalCents,
        };
      });

      // Calculate fees
      const deliveryFeeCents = fulfillment === 'delivery' ? 100000 : 0; // 1000 FCFA
      const taxCents = 0; // No tax for now
      const totalCents = subtotalCents + deliveryFeeCents + taxCents;

      // Create order with items (transaction)
      const order = await prisma.$transaction(async (tx: any) => {
        const createdOrder = await tx.order.create({
          data: {
            orderNumber: `GG-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`,
            userId,
            status: 'pending',
            fulfillment,
            addressId: addressId || null,
            subtotalCents,
            deliveryFeeCents,
            taxCents,
            totalCents,
            paymentStatus: fulfillment === 'cash_on_delivery' ? 'pending' : 'pending',
            notes: notes || null,
            items: {
              create: orderItems,
            },
          },
          include: {
            items: true,
            user: { select: { id: true, fullName: true, email: true } },
          },
        });

        // Decrement stock
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        return createdOrder;
      });

      // Notify admins
      await NotificationService.notifyNewOrder(order.orderNumber, order.totalCents);

      sendSuccess(res, 201, 'Commande créée', { order });
    } catch (error: any) {
      if (error.message?.includes('Stock insuffisant')) {
        sendError(res, 400, error.message);
      } else {
        next(error);
      }
    }
  }

  /**
   * Get current user's orders
   */
  static async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { userId },
          include: {
            items: {
              include: {
                product: { select: { name: true, slug: true } },
              },
            },
            messages: {
              select: { id: true },
              where: { senderId: { not: userId }, isRead: false },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.order.count({ where: { userId } }),
      ]);

      // Add unread message count to each order
      const enriched = orders.map((o: any) => ({
        ...o,
        unreadMessages: o.messages.length,
        messages: undefined,
      }));

      sendSuccess(res, 200, 'Commandes récupérées', {
        orders: enriched,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single order by ID
   */
  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const isAdmin = (req as any).user?.isAdmin;

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, slug: true },
              },
            },
          },
          address: true,
          payments: true,
          user: { select: { id: true, fullName: true, email: true, phone: true } },
        },
      });

      if (!order) {
        sendError(res, 404, 'Commande non trouvée');
        return;
      }

      // Check access
      if (!isAdmin && order.userId !== userId) {
        sendError(res, 403, 'Accès non autorisé');
        return;
      }

      sendSuccess(res, 200, 'Commande récupérée', { order });
    } catch (error) {
      next(error);
    }
  }
}
