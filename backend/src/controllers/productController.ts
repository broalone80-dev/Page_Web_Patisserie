import { Response } from 'express';
import { AuthRequest, CreateProductDTO, UpdateProductDTO } from '../types/index';
import { ProductService } from '@services/productService';
import { sendSuccess, sendError } from '@utils/responses';
import { ApiError } from '@utils/errors';

export class ProductController {
  /**
   * GET /api/products
   */
  static async getAllProducts(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = (page - 1) * limit;
      const featured = req.query.featured === 'true' ? true : undefined;
      const search = (req.query.search as string)?.trim() || undefined;

      const result = await ProductService.getAllProducts(skip, limit, true, featured, search);
      sendSuccess(res, 200, 'Produits récupérés', { products: result.products, total: result.total, page, limit });
    } catch (error) {
      sendError(res, 500, 'Failed to fetch products');
    }
  }

  /**
   * GET /api/products/:slug
   */
  static async getProductBySlug(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const product = await ProductService.getProductBySlug(slug);
      sendSuccess(res, 200, 'Produit récupéré', { product });
    } catch (error) {
      if (error instanceof ApiError) {
        sendError(res, error.statusCode, error.message);
      } else {
        sendError(res, 500, 'Failed to fetch product');
      }
    }
  }

  /**
   * POST /api/products (admin only)
   */
  static async createProduct(req: AuthRequest, res: Response) {
    try {
      const data = req.body as CreateProductDTO;

      if (!data.name || !data.slug || !data.priceCents) {
        sendError(res, 400, 'Missing required fields: name, slug, priceCents');
        return;
      }

      const product = await ProductService.createProduct(data);
      sendSuccess(res, 201, 'Product created successfully', product);
    } catch (error) {
      if (error instanceof ApiError) {
        sendError(res, error.statusCode, error.message);
      } else {
        sendError(res, 500, 'Failed to create product');
      }
    }
  }

  /**
   * PUT /api/products/:id (admin only)
   */
  static async updateProduct(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateProductDTO;

      const product = await ProductService.updateProduct(id, data);
      sendSuccess(res, 200, 'Product updated successfully', product);
    } catch (error) {
      if (error instanceof ApiError) {
        sendError(res, error.statusCode, error.message);
      } else {
        sendError(res, 500, 'Failed to update product');
      }
    }
  }

  /**
   * DELETE /api/products/:id (admin only)
   */
  static async deleteProduct(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.deleteProduct(id);
      sendSuccess(res, 200, 'Product deleted successfully', product);
    } catch (error) {
      if (error instanceof ApiError) {
        sendError(res, error.statusCode, error.message);
      } else {
        sendError(res, 500, 'Failed to delete product');
      }
    }
  }

  /**
   * POST /api/products/:id/images (admin only)
   */
  static async addProductImage(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { url, altText } = req.body;

      if (!url) {
        sendError(res, 400, 'Image URL is required');
        return;
      }

      const image = await ProductService.addProductImage(id, url, altText);
      sendSuccess(res, 201, 'Image added successfully', image);
    } catch (error) {
      if (error instanceof ApiError) {
        sendError(res, error.statusCode, error.message);
      } else {
        sendError(res, 500, 'Failed to add image');
      }
    }
  }
}
