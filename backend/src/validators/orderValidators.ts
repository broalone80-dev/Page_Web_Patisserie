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
    fulfillment: z.enum(['delivery', 'pickup', 'cash_on_delivery'], {
        errorMap: () => ({ message: 'Mode de livraison invalide' }),
    }),
    addressId: z.string().uuid().optional(),
    notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'en_preparation', 'validee', 'livree', 'cancelled'], {
        errorMap: () => ({ message: 'Statut invalide' }),
    }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
