/**
 * Fix the 10 missing product images with alternative URLs
 * Usage: npx ts-node -r tsconfig-paths/register src/prisma/seed-images-fix.ts
 */

import { PrismaClient } from '@prisma/client';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'products');
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

const fixImages: Record<string, string> = {
  'beignets-mais': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&h=600&fit=crop',
  'cake-nature': 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=600&fit=crop&q=90',
  'crepe-jambon-5': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=600&fit=crop&q=90',
  'crepes-nutella-marbrees-5': 'https://images.unsplash.com/photo-1584365685547-9a5fb6f3a70c?w=600&h=600&fit=crop&q=90',
  'pancakes-pepites-chocolat-5': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=600&fit=crop&q=90',
  'crepes-croquantes-premium-5': 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=600&fit=crop&q=90',
  'crepe-jambon-fromage-bechamel-5': 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=600&h=600&fit=crop&q=90',
  'crepe-viande-hachee-fromage-5': 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=600&h=600&fit=crop&q=80',
  'mini-quiches-lorraines-10': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop',
  'supplement-pomme-de-terre': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=600&fit=crop&q=90',
};

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('🔧 Fixing missing product images...\n');

  let successCount = 0;

  for (const [slug, imageUrl] of Object.entries(fixImages)) {
    const product = await prisma.product.findFirst({ where: { slug }, select: { id: true, name: true } });
    if (!product) {
      console.log(`  ⏭️  ${slug} — product not found`);
      continue;
    }

    const fileName = `${slug}-1.jpg`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    const publicUrl = `${BASE_URL}/uploads/products/${fileName}`;

    try {
      process.stdout.write(`  ⬇️  ${product.name}...`);
      await downloadFile(imageUrl, filePath);

      // Check if image already exists in DB for this product
      const existing = await prisma.productImage.findFirst({ where: { productId: product.id } });
      if (!existing) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: publicUrl,
            publicId: `products/${fileName}`,
            altText: product.name,
            position: 0,
          },
        });
      }

      console.log(' ✅');
      successCount++;
    } catch (err: any) {
      console.log(` ❌ ${err.message}`);
    }
  }

  console.log(`\n✅ Fixed ${successCount} images`);
}

main()
  .catch((e) => { console.error('❌ Fix failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
