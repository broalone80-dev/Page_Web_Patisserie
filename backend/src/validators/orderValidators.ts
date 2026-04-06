import { z } from 'zod';

/**
 * Order Zod schemas
 */

export const orderItemSchema = z.object({
    productId: z.string().uuid('ID produit invalide'),
    quantity: z.number().int().min(1, 'Quantité minimum: 1').max(100),
});

export const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1, 'Panier vide'),
    fulfillment: z.enum(['delivery', 'pickup'], {
        errorMap: () => ({ message: 'Mode de livraison invalide' }),
    }),
    addressId: z.string().uuid().optional(),
    quarter: z.string().max(100).optional(),
    notes: z.string().max(500).optional(),
    paymentMethod: z.enum(['orange_money', 'mtn_momo', 'cash_on_delivery']).optional(),
    paymentPhone: z.string().max(20).optional(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'preparing', 'delivering', 'delivered', 'cancelled'], {
        errorMap: () => ({ message: 'Statut invalide' }),
    }),
    note: z.string().max(500).optional(),
});

export const validateDeliverySchema = z.object({
    code: z.string().length(6, 'Le code doit contenir 6 chiffres').regex(/^\d{6}$/, 'Code invalide'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ValidateDeliveryInput = z.infer<typeof validateDeliverySchema>;
