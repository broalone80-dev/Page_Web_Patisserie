import prisma from '@config/database';
import { CreateProductDTO, UpdateProductDTO } from '../types/index';
import { ApiError } from '@utils/errors';

export class ProductService {
  /**
   * Get all products with filters
   */
  static async getAllProducts(
    skip = 0,
    take = 20,
    isActive?: boolean,
    isFeatured?: boolean,
    search?: string
  ) {
    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      skip,
      take,
      include: {
        categories: {
          include: { category: true },
        },
        images: {
          orderBy: { position: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.product.count({ where });

    return { products, total };
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
      },
    });

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return product;
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return product;
  }

  /**
   * Create product (admin only)
   */
  static async createProduct(data: CreateProductDTO) {
    // Check if slug is unique
    const existingProduct = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existingProduct) {
      throw new ApiError(400, 'Product slug already exists');
    }

    return prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        priceCents: data.priceCents,
        stock: data.stock,
        isActive: data.isActive,
        metadata: data.metadata || {},
      },
      include: {
        images: true,
      },
    });
  }

  /**
   * Update product (admin only)
   */
  static async updateProduct(id: string, data: UpdateProductDTO) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        priceCents: data.priceCents,
        stock: data.stock,
        isActive: data.isActive,
        metadata: data.metadata,
      },
      include: {
        images: true,
      },
    });
  }

  /**
   * Delete product (admin only)
   */
  static async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Soft delete by setting isActive to false
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Add product image
   */
  static async addProductImage(
    productId: string,
    url: string,
    altText?: string
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return prisma.productImage.create({
      data: {
        productId,
        url,
        altText: altText || '',
        position: 0,
      },
    });
  }
}
