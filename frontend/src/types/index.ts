export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  isAdmin: boolean;
  isManager: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  stock: number;
  isActive: boolean;
  metadata: Record<string, any>;
  images: ProductImage[];
  createdAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  position: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  totalCents: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  lat?: number;
  lng?: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productSnapshot: Record<string, any>;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

export interface OrderStatusLog {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string | null;
  note: string | null;
  changer?: { id: string; fullName: string | null };
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  fulfillment: 'delivery' | 'pickup';
  items: OrderItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  taxCents: number;
  totalCents: number;
  paymentStatus: string;
  paymentMethod?: string;
  paymentPhone?: string;
  notes?: string;
  estimatedReadyAt?: string;
  deliveredAt?: string;
  statusLogs?: OrderStatusLog[];
  deliveryCode?: { isUsed: boolean; expiresAt: string; createdAt: string };
  user?: { id: string; fullName?: string; email: string; phone?: string };
  address?: Address;
  unreadMessages?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ManagerStats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  deliveringOrders: number;
  deliveredToday: number;
  totalRevenue: number;
  unreadMessages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}
