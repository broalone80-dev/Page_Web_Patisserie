import { Request, Response, NextFunction } from 'express';
import prisma from '@config/database';
import { sendSuccess, sendError } from '@utils/responses';
import { NotificationService } from '@services/notificationService';

/**
 * Admin Controller – Dashboard, Users management, and Order status updates
 */
export class AdminController {
  /**
   * Dashboard stats
   */
  static async getDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenueCents,
        recentOrders,
        recentUsers,
      ] = await Promise.all([
        prisma.user.count({ where: { isAdmin: false } }),
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.count({ where: { status: 'pending' } }),
        prisma.order.aggregate({
          _sum: { totalCents: true },
          where: { paymentStatus: 'successful' },
        }),
        prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            items: { select: { quantity: true } },
          },
        }),
        prisma.user.findMany({
          take: 5,
          where: { isAdmin: false },
          orderBy: { createdAt: 'desc' },
          select: { id: true, fullName: true, email: true, phone: true, createdAt: true },
        }),
      ]);

      sendSuccess(res, 200, 'Dashboard récupéré', {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          pendingOrders,
          totalRevenue: totalRevenueCents._sum.totalCents || 0,
        },
        recentOrders,
        recentUsers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users (admin)
   */
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            isAdmin: true,
            isActive: true,
            createdAt: true,
            _count: { select: { orders: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      sendSuccess(res, 200, 'Utilisateurs récupérés', {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        sendError(res, 404, 'Utilisateur non trouvé');
        return;
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { isActive: !user.isActive },
        select: { id: true, email: true, isActive: true },
      });

      sendSuccess(res, 200, `Utilisateur ${updated.isActive ? 'activé' : 'désactivé'}`, { user: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders (admin) with filters
   */
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status && status !== 'all') {
        where.status = status;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: { select: { id: true, fullName: true, email: true, phone: true } },
            items: {
              include: {
                product: { select: { name: true } },
              },
            },
            address: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.order.count({ where }),
      ]);

      sendSuccess(res, 200, 'Commandes récupérées', {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status (with notification)
   */
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

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

      const updated = await prisma.order.update({
        where: { id },
        data: { status },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          items: true,
        },
      });

      // Notify client of status change
      if (order.userId) {
        await NotificationService.notifyOrderStatusChange(
          order.userId,
          order.orderNumber,
          status,
          order.user?.email
        );
      }

      // Log audit
      const actorId = (req as any).user?.id;
      await prisma.auditLog.create({
        data: {
          actorId,
          action: 'order_status_change',
          resource: 'order',
          resourceId: id,
          details: { previousStatus: order.status, newStatus: status },
        },
      });

      sendSuccess(res, 200, 'Statut commande mis à jour', { order: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin product CRUD – Create
   */
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryIds, ...productData } = req.body;

      const product = await prisma.product.create({
        data: {
          ...productData,
          categories: categoryIds
            ? {
              create: categoryIds.map((catId: string) => ({
                category: { connect: { id: catId } },
              })),
            }
            : undefined,
        },
        include: {
          images: true,
          categories: { include: { category: true } },
        },
      });

      sendSuccess(res, 201, 'Produit créé', { product });
    } catch (error: any) {
      if (error.code === 'P2002') {
        sendError(res, 400, 'Ce slug existe déjà');
      } else {
        next(error);
      }
    }
  }

  /**
   * Admin product CRUD – Update
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { categoryIds, ...productData } = req.body;

      // Update product data
      await prisma.product.update({
        where: { id },
        data: productData,
      });

      // Update categories if provided
      if (categoryIds) {
        // Delete existing links
        await prisma.productCategory.deleteMany({ where: { productId: id } });
        // Create new links
        await prisma.productCategory.createMany({
          data: categoryIds.map((catId: string) => ({
            productId: id,
            categoryId: catId,
          })),
        });
      }

      const result = await prisma.product.findUnique({
        where: { id },
        include: {
          images: { orderBy: { position: 'asc' } },
          categories: { include: { category: true } },
        },
      });

      sendSuccess(res, 200, 'Produit mis à jour', { product: result });
    } catch (error: any) {
      if (error.code === 'P2025') {
        sendError(res, 404, 'Produit non trouvé');
      } else {
        next(error);
      }
    }
  }

  /**
   * Admin product CRUD – Delete
   */
  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.product.delete({ where: { id } });
      sendSuccess(res, 200, 'Produit supprimé');
    } catch (error: any) {
      if (error.code === 'P2025') {
        sendError(res, 404, 'Produit non trouvé');
      } else {
        next(error);
      }
    }
  }

  /**
   * Add images to product
   */
  static async addProductImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { images } = req.body; // [{url, publicId, altText, position}]

      const created = await prisma.productImage.createMany({
        data: images.map((img: any) => ({
          productId: id,
          url: img.url,
          publicId: img.publicId || null,
          altText: img.altText || '',
          position: img.position || 0,
        })),
      });

      sendSuccess(res, 201, 'Images ajoutées', { count: created.count });
    } catch (error) {
      next(error);
    }
  }
}
