import { z } from 'zod';

/**
 * Chat Zod schemas
 */

export const sendMessageSchema = z.object({
    content: z.string().min(1, 'Message vide').max(2000, 'Message trop long'),
});

export const categorySchema = z.object({
    name: z.string().min(2, 'Nom requis').max(100),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug invalide'),
    description: z.string().max(500).optional(),
    imageUrl: z.string().url().optional(),
    parentId: z.string().uuid().nullable().optional(),
    position: z.number().int().min(0).default(0),
});

export const updateCategorySchema = categorySchema.partial();

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
