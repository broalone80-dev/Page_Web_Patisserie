/**
 * Seed product images - Downloads real pastry/food photos
 * and assigns them to products in the database.
 *
 * Usage: npx ts-node -r tsconfig-paths/register src/prisma/seed-images.ts
 */

import { PrismaClient } from '@prisma/client';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'products');
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

/**
 * Map product slugs to Unsplash photo IDs that match the product.
 * All images are from Unsplash (free to use).
 */
const productImages: Record<string, string[]> = {
  // ── CAKES ──
  'cake-nature': [
    'https://images.unsplash.com/photo-1486427944544-d2c246c4df75?w=600&h=600&fit=crop',
  ],
  'cake-chocolat': [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=600&fit=crop',
  ],
  'cake-citron': [
    'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&h=600&fit=crop',
  ],
  'cake-velours': [
    'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&h=600&fit=crop',
  ],
  'cake-orange': [
    'https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?w=600&h=600&fit=crop',
  ],
  'cake-carotte': [
    'https://images.unsplash.com/photo-1621955964441-c173e01c135b?w=600&h=600&fit=crop',
  ],
  'cake-yaourt': [
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=600&fit=crop',
  ],
  'cake-coco': [
    'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&h=600&fit=crop&q=80',
  ],
  'cake-marbre': [
    'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&h=600&fit=crop',
  ],
  'cake-petite-choco': [
    'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&h=600&fit=crop',
  ],
  'brownies-lot-10': [
    'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=600&h=600&fit=crop',
  ],

  // ── CRÊPES SUCRÉES ──
  'crepes-natures-10': [
    'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&h=600&fit=crop',
  ],
  'crepes-tartinees-10': [
    'https://images.unsplash.com/photo-1584365685547-9a5fb6f3a70c?w=600&h=600&fit=crop',
  ],
  'crepes-marbrees-5': [
    'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=600&h=600&fit=crop',
  ],
  'crepes-coco-choco-5': [
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=600&fit=crop',
  ],
  'crepes-orange-5': [
    'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&h=600&fit=crop',
  ],
  'crepes-nutella-marbrees-5': [
    'https://images.unsplash.com/photo-1635432819182-8df39ff2a358?w=600&h=600&fit=crop',
  ],
  'crepes-chocolat-5': [
    'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&h=600&fit=crop&q=80',
  ],
  'crepes-nutella-5': [
    'https://images.unsplash.com/photo-1584365685547-9a5fb6f3a70c?w=600&h=600&fit=crop&q=80',
  ],
  'crepes-croquantes-premium-5': [
    'https://images.unsplash.com/photo-1635432819182-8df39ff2a358?w=600&h=600&fit=crop&q=90',
  ],

  // ── CRÊPES SALÉES ──
  'crepe-jambon-5': [
    'https://images.unsplash.com/photo-1522764725576-4cbbd0432885?w=600&h=600&fit=crop',
  ],
  'crepe-jambon-fromage-bechamel-5': [
    'https://images.unsplash.com/photo-1595515292056-ce5a10a1fbe5?w=600&h=600&fit=crop',
  ],
  'crepe-viande-hachee-5': [
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=600&fit=crop',
  ],
  'crepe-viande-hachee-fromage-5': [
    'https://images.unsplash.com/photo-1595515292056-ce5a10a1fbe5?w=600&h=600&fit=crop&q=80',
  ],
  'crepe-viande-hachee-fromage-jambon-5': [
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=600&fit=crop&q=80',
  ],

  // ── PANCAKES ──
  'pancakes-natures': [
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=600&fit=crop',
  ],
  'pancakes-pepites-chocolat-5': [
    'https://images.unsplash.com/photo-1541288097308-7b8e3bef3c28?w=600&h=600&fit=crop',
  ],
  'pancakes-raisin-sec-5': [
    'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&h=600&fit=crop',
  ],
  'pancakes-fourres-nutella-5': [
    'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&h=600&fit=crop&q=80',
  ],

  // ── BEIGNETS ──
  'beignets-souffles': [
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=600&fit=crop',
  ],
  'beignets-banane': [
    'https://images.unsplash.com/photo-1609951651556-5334e2706168?w=600&h=600&fit=crop',
  ],
  'beignets-mais': [
    'https://images.unsplash.com/photo-1558303006-1f3be02f297a?w=600&h=600&fit=crop',
  ],

  // ── GAUFRES SUCRÉES ──
  'gaufres-natures-10': [
    'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&h=600&fit=crop',
  ],
  'gaufres-tartinees-10': [
    'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=600&h=600&fit=crop',
  ],
  'mini-coeurs-gaufres-10': [
    'https://images.unsplash.com/photo-1557308536-ee471ef2c390?w=600&h=600&fit=crop',
  ],
  'mini-coeurs-gaufres-tartines-10': [
    'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=600&h=600&fit=crop&q=80',
  ],

  // ── GAUFRES SALÉES ──
  'gaufre-jambon-fromage-5': [
    'https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=600&h=600&fit=crop',
  ],

  // ── MINI ARDOISES ──
  'nems-viande-10': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop',
  ],
  'boulettes-viande-plantains-10': [
    'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&h=600&fit=crop',
  ],
  'mini-burgers-10': [
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=600&fit=crop',
  ],
  'mini-pizzas-10': [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=600&fit=crop',
  ],
  'mini-quiches-lorraines-10': [
    'https://images.unsplash.com/photo-1608039829572-07f08de85e9b?w=600&h=600&fit=crop',
  ],

  // ── PASTELS ──
  'pastel-viande-hachee-5': [
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=600&fit=crop',
  ],
  'pastel-viande-hachee-fromage-5': [
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=600&fit=crop&q=80',
  ],
  'pastel-poisson-hache-5': [
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=600&fit=crop',
  ],
  'pastel-vegetarien-5': [
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=600&fit=crop&q=90',
  ],

  // ── SUPPLÉMENTS ──
  'supplement-pomme-de-terre': [
    'https://images.unsplash.com/photo-1518977676601-b53f82ber3a?w=600&h=600&fit=crop',
  ],
  'supplement-oeuf-dur': [
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=600&fit=crop',
  ],

  // ── DESSERTS ──
  'verrine-oreo': [
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=600&fit=crop',
  ],
  'verrine-chocolat': [
    'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=600&h=600&fit=crop',
  ],
  'verrine-fruits': [
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=600&fit=crop&q=80',
  ],

  // ── YAOURTS & BOISSONS ──
  'yaourt-artisanal-nature': [
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=600&fit=crop&q=90',
  ],
  'yaourt-artisanal-sucre': [
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=600&fit=crop',
  ],
  'yaourt-artisanal-lot-10': [
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=600&fit=crop&q=80',
  ],
};

/**
 * Download a file from URL, following redirects
 */
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      // Follow redirects (301, 302, 307, 308)
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
  console.log('🖼️  Seeding product images...\n');

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  // Delete existing images in DB
  const deleted = await prisma.productImage.deleteMany();
  console.log(`🗑️  Deleted ${deleted.count} existing images from DB`);

  // Get all products
  const products = await prisma.product.findMany({ select: { id: true, slug: true, name: true } });
  console.log(`📦 Found ${products.length} products\n`);

  let successCount = 0;
  let failCount = 0;

  for (const product of products) {
    const urls = productImages[product.slug];
    if (!urls || urls.length === 0) {
      console.log(`  ⏭️  ${product.name} — no image URL mapped`);
      continue;
    }

    for (let i = 0; i < urls.length; i++) {
      const imageUrl = urls[i];
      const fileName = `${product.slug}-${i + 1}.jpg`;
      const filePath = path.join(UPLOADS_DIR, fileName);
      const publicUrl = `${BASE_URL}/uploads/products/${fileName}`;

      try {
        process.stdout.write(`  ⬇️  ${product.name}...`);
        await downloadFile(imageUrl, filePath);

        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: publicUrl,
            publicId: `products/${fileName}`,
            altText: product.name,
            position: i,
          },
        });

        console.log(' ✅');
        successCount++;
      } catch (err: any) {
        console.log(` ❌ ${err.message}`);
        failCount++;
      }
    }
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`🎉 IMAGE SEED COMPLETE`);
  console.log(`  ✅ ${successCount} images downloaded & linked`);
  if (failCount > 0) console.log(`  ❌ ${failCount} failed`);
  console.log(`  📂 Stored in: ${UPLOADS_DIR}`);
  console.log(`${'═'.repeat(50)}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Image seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
