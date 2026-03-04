import { z } from 'zod';

/**
 * Product Zod schemas
 */

export const createProductSchema = z.object({
    name: z.string().min(2, 'Nom requis').max(200),
    slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Slug invalide'),
    description: z.string().min(10, 'Description: 10 caractères minimum').max(5000),
    priceCents: z.number().int().min(100, 'Prix minimum: 100 FCFA'),
    stock: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    categoryIds: z.array(z.string().uuid()).optional(),
    metadata: z.record(z.any()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
