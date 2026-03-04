import { Request, Response, NextFunction } from 'express';
import prisma from '@config/database';
import { sendSuccess, sendError } from '@utils/responses';

/**
 * Category Controller – CRUD for product categories
 */
export class CategoryController {
    /**
     * Get all categories (public)
     */
    static async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await prisma.category.findMany({
                include: {
                    children: true,
                    products: {
                        select: { productId: true },
                    },
                },
                orderBy: { position: 'asc' },
            });

            const result = categories.map((c: any) => ({
                ...c,
                productCount: c.products.length,
                products: undefined, // Remove join table from response
            }));

            sendSuccess(res, 200, 'Catégories récupérées', { categories: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get single category by slug (public)
     */
    static async getBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const { slug } = req.params;
            const category = await prisma.category.findUnique({
                where: { slug },
                include: {
                    children: true,
                    products: {
                        include: {
                            product: {
                                include: {
                                    images: { orderBy: { position: 'asc' }, take: 1 },
                                },
                            },
                        },
                    },
                },
            });

            if (!category) {
                sendError(res, 404, 'Catégorie non trouvée');
                return;
            }

            sendSuccess(res, 200, 'Catégorie récupérée', { category });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a category (admin)
     */
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await prisma.category.create({
                data: req.body,
            });
            sendSuccess(res, 201, 'Catégorie créée', { category });
        } catch (error: any) {
            if (error.code === 'P2002') {
                sendError(res, 400, 'Ce nom ou slug existe déjà');
            } else {
                next(error);
            }
        }
    }

    /**
     * Update a category (admin)
     */
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const category = await prisma.category.update({
                where: { id },
                data: req.body,
            });
            sendSuccess(res, 200, 'Catégorie mise à jour', { category });
        } catch (error: any) {
            if (error.code === 'P2025') {
                sendError(res, 404, 'Catégorie non trouvée');
            } else if (error.code === 'P2002') {
                sendError(res, 400, 'Ce nom ou slug existe déjà');
            } else {
                next(error);
            }
        }
    }

    /**
     * Delete a category (admin)
     */
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await prisma.category.delete({ where: { id } });
            sendSuccess(res, 200, 'Catégorie supprimée');
        } catch (error: any) {
            if (error.code === 'P2025') {
                sendError(res, 404, 'Catégorie non trouvée');
            } else {
                next(error);
            }
        }
    }
}
