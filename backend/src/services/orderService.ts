import prisma from '@config/database';
import { CreateOrderDTO, UpdateOrderStatusDTO } from '../types/index';
import { ApiError } from '@utils/errors';
import { v4 as uuidv4 } from 'uuid';

export class OrderService {
  /**
   * Create a new order
   */
  static async createOrder(userId: string, data: CreateOrderDTO) {
    // Validate items and check stock
    const items = [];
    let subtotalCents = 0;

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new ApiError(400, `Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }

      items.push({
        productId: product.id,
        productSnapshot: {
          id: product.id,
          name: product.name,
          priceCents: product.priceCents,
        },
        quantity: item.quantity,
        unitPriceCents: product.priceCents,
        totalCents: product.priceCents * item.quantity,
      });

      subtotalCents += product.priceCents * item.quantity;
    }

    // Calculate totals
    const deliveryFeeCents = data.fulfillment === 'delivery' ? (data.deliveryFee || 0) : 0;
    const taxCents = Math.floor(subtotalCents * 0.05); // 5% tax
    const totalCents = subtotalCents + deliveryFeeCents + taxCents;

    // Create order in transaction
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`,
        userId,
        status: 'pending',
        fulfillment: data.fulfillment,
        addressId: data.addressId || null,
        subtotalCents,
        deliveryFeeCents,
        taxCents,
        totalCents,
        paymentStatus: 'pending',
        paymentMethod: data.paymentMethod || null,
        paymentPhone: data.paymentPhone || null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productSnapshot: item.productSnapshot,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            totalCents: item.totalCents,
          })),
        },
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    // Decrement stock for each product
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return order;
  }

  /**
   * Get order by ID
   */
  static async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: {
          select: { id: true, email: true, fullName: true, phone: true },
        },
        address: true,
      },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return order;
  }

  /**
   * Get user's orders
   */
  static async getUserOrders(userId: string, skip = 0, take = 20) {
    const orders = await prisma.order.findMany({
      where: { userId },
      skip,
      take,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.order.count({ where: { userId } });

    return { orders, total };
  }

  /**
   * Update order status (admin only)
   */
  static async updateOrderStatus(id: string, data: UpdateOrderStatusDTO) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return prisma.order.update({
      where: { id },
      data: { status: data.status },
      include: {
        items: true,
        user: true,
      },
    });
  }

  /**
   * Get all orders (admin only)
   */
  static async getAllOrders(skip = 0, take = 50) {
    const orders = await prisma.order.findMany({
      skip,
      take,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.order.count();

    return { orders, total };
  }

  /**
   * Get order statistics (admin only)
   */
  static async getOrderStats() {
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({
      where: { status: 'pending' },
    });
    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalCents: true },
    });

    return {
      totalOrders,
      pendingOrders,
      totalRevenueCents: totalRevenue._sum.totalCents || 0,
    };
  }
}
