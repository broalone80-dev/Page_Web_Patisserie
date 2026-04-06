import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// ============================================
// AUTH
// ============================================

export interface AuthPayload extends JwtPayload {
  id: string;
  email: string;
  isAdmin: boolean;
  isManager: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

// ============================================
// DTOs
// ============================================

export interface CreateUserDTO {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateProductDTO {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  stock: number;
  isActive: boolean;
  isFeatured?: boolean;
  categoryIds?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> { }

export interface CreateOrderDTO {
  items: OrderItemInput[];
  fulfillment: 'delivery' | 'pickup';
  addressId?: string;
  notes?: string;
  deliveryFee?: number;
  paymentMethod?: 'orange_money' | 'mtn_momo' | 'cash_on_delivery';
  paymentPhone?: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface UpdateOrderStatusDTO {
  status: 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  note?: string;
}

export interface ValidateDeliveryDTO {
  code: string;
}
