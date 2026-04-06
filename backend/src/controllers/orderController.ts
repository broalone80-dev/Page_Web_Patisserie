import { Request, Response, NextFunction } from 'express';
import prisma from '@config/database';
import { sendSuccess, sendError } from '@utils/responses';
import { NotificationService } from '@services/notificationService';
import { DeliveryService } from '@services/deliveryService';
import { emitToUser, emitToOrder } from '@config/websocket';
import { v4 as uuidv4 } from 'uuid';

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['delivering', 'cancelled'],
  delivering: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  // Legacy French statuses → map to same transitions
  en_attente: ['preparing', 'cancelled'],
  en_preparation: ['delivering', 'cancelled'],
  en_livraison: ['delivered', 'cancelled'],
  validee: ['preparing', 'cancelled'],
  livree: [],
  annulee: [],
};

/**
 * Order Controller – Create, list, track, deliver
 */
export class OrderController {
  /**
   * Create a new order
   */
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { items, fulfillment, addressId, notes } = req.body;

      // Calculate delivery fee server-side based on address
      const deliveryFeeCents = fulfillment === 'delivery'
        ? OrderController.calculateDeliveryFee(req.body.quarter, req.body.subtotalHint)
        : 0;

      // === ENTIRE order creation inside a SERIALIZABLE transaction ===
      // This prevents race conditions on stock
      const order = await prisma.$transaction(async (tx: any) => {
        // 1. Lock & validate products inside transaction
        const productIds = items.map((i: any) => i.productId);
        // Use raw query with FOR UPDATE to lock rows (PostgreSQL)
        const placeholders = productIds.map((_: any, i: number) => `$${i + 1}`).join(',');
        const lockedProducts: any[] = await tx.$queryRawUnsafe(
          `SELECT id, name, "priceCents", stock, "isActive" FROM products WHERE id IN (${placeholders}) FOR UPDATE`,
          ...productIds
        );

        if (lockedProducts.length !== items.length) {
          throw new Error('Certains produits sont indisponibles');
        }

        // 2. Validate stock & build order items inside lock
        let subtotalCents = 0;
        const orderItems: any[] = [];

        for (const item of items as { productId: string; quantity: number }[]) {
          const product = lockedProducts.find((p: any) => p.id === item.productId);
          if (!product || !product.isActive) {
            throw new Error(`Produit indisponible`);
          }
          if (product.stock < item.quantity) {
            throw new Error(`Stock insuffisant pour ${product.name} (disponible: ${product.stock})`);
          }

          const totalCents = product.priceCents * item.quantity;
          subtotalCents += totalCents;

          // Get image for snapshot
          const image = await tx.productImage.findFirst({
            where: { productId: item.productId },
            orderBy: { position: 'asc' },
            select: { url: true },
          });

          orderItems.push({
            productId: item.productId,
            productSnapshot: {
              name: product.name,
              priceCents: product.priceCents,
              image: image?.url || null,
            },
            quantity: item.quantity,
            unitPriceCents: product.priceCents,
            totalCents,
          });
        }

        // 3. Calculate totals server-side
        const taxCents = 0;
        const totalCents = subtotalCents + deliveryFeeCents + taxCents;

        // 4. Create the order
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
            paymentStatus: 'pending',
            paymentMethod: req.body.paymentMethod || null,
            paymentPhone: req.body.paymentPhone || null,
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

        // 5. Status log
        await tx.orderStatusLog.create({
          data: {
            orderId: createdOrder.id,
            fromStatus: null,
            toStatus: 'pending',
            changedBy: userId,
            note: 'Commande créée',
          },
        });

        // 6. Atomically decrement stock (inside same transaction = safe)
        for (const item of items as { productId: string; quantity: number }[]) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        return createdOrder;
      }, {
        isolationLevel: 'Serializable',
        timeout: 15000,
      });

      // Notify admins & managers (outside transaction for speed)
      await NotificationService.notifyNewOrder(order.id, order.orderNumber, order.totalCents);

      sendSuccess(res, 201, 'Commande créée', { order });
    } catch (error: any) {
      if (error.message?.includes('Stock insuffisant') || error.message?.includes('indisponible')) {
        sendError(res, 400, error.message);
      } else {
        next(error);
      }
    }
  }

  /**
   * Calculate delivery fee server-side based on zone
   */
  private static calculateDeliveryFee(quarter?: string, subtotalHint?: number): number {
    // Free delivery above 15,000 FCFA
    if (subtotalHint && subtotalHint >= 1500000) return 0;

    const centreVille = ['centre', 'centre-ville', 'bastos', 'nlongkak', 'mvan', 'hippodrome', 'tsinga', 'messa'];
    if (quarter && centreVille.some(q => quarter.toLowerCase().includes(q))) {
      return 50000; // 500 FCFA
    }
    return 100000; // 1000 FCFA (default)
  }

  /**
   * GET /api/orders/delivery-fee?quarter=bastos&subtotal=500000
   * Calculate delivery fee for frontend display
   */
  static async getDeliveryFee(req: Request, res: Response) {
    const quarter = req.query.quarter as string | undefined;
    const subtotal = parseInt(req.query.subtotal as string) || 0;
    const fulfillment = req.query.fulfillment as string || 'delivery';

    const fee = fulfillment === 'pickup' ? 0 : OrderController.calculateDeliveryFee(quarter, subtotal);
    sendSuccess(res, 200, 'Frais calculés', { deliveryFeeCents: fee });
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
   * Get a single order by ID (with status history)
   */
  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const isAdmin = (req as any).user?.isAdmin;
      const isManager = (req as any).user?.isManager;

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: { select: { name: true, slug: true } },
            },
          },
          address: true,
          payments: true,
          user: { select: { id: true, fullName: true, email: true, phone: true } },
          statusLogs: {
            orderBy: { createdAt: 'asc' },
            include: {
              changer: { select: { id: true, fullName: true } },
            },
          },
          deliveryCode: {
            select: { isUsed: true, expiresAt: true, createdAt: true },
          },
        },
      });

      if (!order) {
        sendError(res, 404, 'Commande non trouvée');
        return;
      }

      // Check access
      if (!isAdmin && !isManager && order.userId !== userId) {
        sendError(res, 403, 'Accès non autorisé');
        return;
      }

      sendSuccess(res, 200, 'Commande récupérée', { order });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status (manager/admin only)
   * Validates status transitions and logs changes
   */
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const actorId = (req as any).user?.id;

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
        },
      });

      if (!order) {
        sendError(res, 404, 'Commande non trouvée');
        return;
      }

      // Validate transition
      const allowedTransitions = VALID_TRANSITIONS[order.status] || [];
      if (!allowedTransitions.includes(status)) {
        sendError(res, 400, `Transition ${order.status} → ${status} non autorisée`);
        return;
      }

      // Use transaction for status update + log
      const updated = await prisma.$transaction(async (tx: any) => {
        const updateData: any = { status };

        // When moving to delivering, generate delivery code
        if (status === 'delivering' && order.fulfillment === 'delivery') {
          updateData.managerId = actorId;
        }

        if (status === 'delivered') {
          updateData.deliveredAt = new Date();
        }

        const updatedOrder = await tx.order.update({
          where: { id },
          data: updateData,
          include: {
            items: true,
            user: { select: { id: true, email: true, fullName: true, phone: true } },
            statusLogs: {
              orderBy: { createdAt: 'asc' },
              include: { changer: { select: { id: true, fullName: true } } },
            },
          },
        });

        // Log the status change
        await tx.orderStatusLog.create({
          data: {
            orderId: id,
            fromStatus: order.status,
            toStatus: status,
            changedBy: actorId,
            note: note || null,
          },
        });

        return updatedOrder;
      });

      // Generate delivery code when status moves to "delivering"
      let deliveryCode: string | null = null;
      if (status === 'delivering' && order.fulfillment === 'delivery') {
        deliveryCode = await DeliveryService.generateDeliveryCode(id);
      }

      // Notify client
      if (order.userId) {
        await NotificationService.notifyOrderStatusChange(
          order.userId,
          id,
          order.orderNumber,
          status,
          order.user?.email
        );

        // Real-time WebSocket push
        emitToUser(order.userId, 'order_status_changed', {
          orderId: id,
          orderNumber: order.orderNumber,
          status,
          previousStatus: order.status,
          deliveryCode: deliveryCode || undefined,
        });
      }

      // Also emit to order room
      emitToOrder(id, 'order_status_changed', {
        orderId: id,
        status,
        previousStatus: order.status,
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          actorId,
          action: 'order_status_change',
          resource: 'order',
          resourceId: id,
          details: { previousStatus: order.status, newStatus: status, note },
        },
      });

      sendSuccess(res, 200, 'Statut mis à jour', {
        order: updated,
        deliveryCode: deliveryCode || undefined,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate delivery with OTP code (manager/admin confirms)
   */
  static async validateDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { code } = req.body;
      const actorId = (req as any).user?.id;

      const order = await prisma.order.findUnique({
        where: { id },
        include: { user: { select: { id: true, email: true, fullName: true } } },
      });

      if (!order) {
        sendError(res, 404, 'Commande non trouvée');
        return;
      }

      if (order.status !== 'delivering') {
        sendError(res, 400, 'La commande n\'est pas en cours de livraison');
        return;
      }

      // Validate the OTP code
      await DeliveryService.validateDeliveryCode(id, code);

      // Mark as delivered
      const updated = await prisma.$transaction(async (tx: any) => {
        const updatedOrder = await tx.order.update({
          where: { id },
          data: { status: 'delivered', deliveredAt: new Date() },
          include: { items: true, user: true },
        });

        await tx.orderStatusLog.create({
          data: {
            orderId: id,
            fromStatus: 'delivering',
            toStatus: 'delivered',
            changedBy: actorId,
            note: 'Livraison confirmée par code OTP',
          },
        });

        return updatedOrder;
      });

      // Notify client
      if (order.userId) {
        await NotificationService.notifyOrderStatusChange(
          order.userId,
          id,
          order.orderNumber,
          'delivered',
          order.user?.email
        );

        emitToUser(order.userId, 'order_status_changed', {
          orderId: id,
          orderNumber: order.orderNumber,
          status: 'delivered',
          previousStatus: 'delivering',
        });
      }

      emitToOrder(id, 'order_status_changed', {
        orderId: id,
        status: 'delivered',
        previousStatus: 'delivering',
      });

      sendSuccess(res, 200, 'Livraison confirmée', { order: updated });
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.statusCode, error.message);
      } else {
        next(error);
      }
    }
  }

  /**
   * Get delivery code for client (only the order owner can see)
   */
  static async getDeliveryCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const order = await prisma.order.findUnique({
        where: { id },
        select: { userId: true, status: true },
      });

      if (!order) {
        sendError(res, 404, 'Commande non trouvée');
        return;
      }

      if (order.userId !== userId) {
        sendError(res, 403, 'Accès non autorisé');
        return;
      }

      if (order.status !== 'delivering') {
        sendError(res, 400, 'Aucun code disponible pour cette commande');
        return;
      }

      const code = await DeliveryService.getPlainCode(id);

      sendSuccess(res, 200, 'Code de livraison', {
        deliveryCode: code,
        hasActiveCode: !!code,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order status timeline
   */
  static async getOrderTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const isAdmin = (req as any).user?.isAdmin;
      const isManager = (req as any).user?.isManager;

      const order = await prisma.order.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!order) {
        sendError(res, 404, 'Commande non trouvée');
        return;
      }

      if (!isAdmin && !isManager && order.userId !== userId) {
        sendError(res, 403, 'Accès non autorisé');
        return;
      }

      const logs = await prisma.orderStatusLog.findMany({
        where: { orderId: id },
        orderBy: { createdAt: 'asc' },
        include: {
          changer: { select: { id: true, fullName: true } },
        },
      });

      sendSuccess(res, 200, 'Timeline récupérée', { timeline: logs });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manager: Get all orders with filters
   */
  static async getManagerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status && status !== 'all') {
        where.status = status;
      }

      const [orders, total, stats] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: { select: { id: true, fullName: true, email: true, phone: true } },
            items: { include: { product: { select: { name: true } } } },
            address: true,
            messages: {
              where: { isRead: false },
              select: { id: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.order.count({ where }),
        prisma.$transaction([
          prisma.order.count({ where: { status: 'pending' } }),
          prisma.order.count({ where: { status: 'preparing' } }),
          prisma.order.count({ where: { status: 'delivering' } }),
          prisma.order.count({ where: { status: 'delivered' } }),
          prisma.order.count(),
        ]),
      ]);

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
        stats: {
          pending: stats[0],
          preparing: stats[1],
          delivering: stats[2],
          delivered: stats[3],
          total: stats[4],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manager dashboard stats
   */
  static async getManagerDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalOrders,
        pendingOrders,
        preparingOrders,
        deliveringOrders,
        deliveredToday,
        totalRevenue,
        recentOrders,
        unreadMessages,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'pending' } }),
        prisma.order.count({ where: { status: 'preparing' } }),
        prisma.order.count({ where: { status: 'delivering' } }),
        prisma.order.count({
          where: { status: 'delivered', deliveredAt: { gte: today } },
        }),
        prisma.order.aggregate({
          _sum: { totalCents: true },
          where: { status: { in: ['delivered'] } },
        }),
        prisma.order.findMany({
          take: 15,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, fullName: true, phone: true } },
            items: { select: { quantity: true, productSnapshot: true } },
          },
        }),
        prisma.message.count({
          where: {
            isRead: false,
            sender: { isAdmin: false, isManager: false },
          },
        }),
      ]);

      sendSuccess(res, 200, 'Dashboard manager', {
        stats: {
          totalOrders,
          pendingOrders,
          preparingOrders,
          deliveringOrders,
          deliveredToday,
          totalRevenue: totalRevenue._sum.totalCents || 0,
          unreadMessages,
        },
        recentOrders,
      });
    } catch (error) {
      next(error);
    }
  }
}
