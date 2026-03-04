import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/jwt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@patisserie.cm',
      passwordHash: adminPassword,
      fullName: 'Admin Patisserie',
      isAdmin: true,
    },
  });

  // Create regular user
  const userPassword = await hashPassword('user123');
  const user = await prisma.user.create({
    data: {
      email: 'customer@patisserie.cm',
      passwordHash: userPassword,
      fullName: 'Jean Dupont',
      phone: '+237612345678',
    },
  });

  // Create sample products
  const croissant = await prisma.product.create({
    data: {
      name: 'Croissant Beurre',
      slug: 'croissant-beurre',
      description: 'Délicieux croissant aux amandes et beurre frais',
      priceCents: 2500, // 2500 XAF
      stock: 50,
      isActive: true,
      metadata: {
        calories: 340,
        allergens: ['gluten', 'butter', 'almonds'],
      },
    },
  });

  const pain = await prisma.product.create({
    data: {
      name: 'Pain Complet',
      slug: 'pain-complet',
      description: 'Pain complet fait maison',
      priceCents: 1500,
      stock: 30,
      isActive: true,
      metadata: {
        calories: 250,
        allergens: ['gluten'],
      },
    },
  });

  const gateau = await prisma.product.create({
    data: {
      name: 'Gâteau Chocolat',
      slug: 'gateau-chocolat',
      description: 'Riche gâteau au chocolat noir',
      priceCents: 8000,
      stock: 10,
      isActive: true,
      metadata: {
        calories: 450,
        allergens: ['gluten', 'eggs', 'dairy', 'nuts'],
      },
    },
  });

  // Add images to products
  await prisma.productImage.create({
    data: {
      productId: croissant.id,
      url: 'https://images.unsplash.com/photo-1585518747522-27ff68595f37?w=500',
      altText: 'Croissant beurre',
      position: 0,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: pain.id,
      url: 'https://images.unsplash.com/photo-1599599810694-6f9e7f33e2d9?w=500',
      altText: 'Pain complet',
      position: 0,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: gateau.id,
      url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
      altText: 'Gâteau chocolat',
      position: 0,
    },
  });

  // Create addresses
  const address1 = await prisma.address.create({
    data: {
      userId: user.id,
      label: 'Home',
      street: '123 Rue de la Paix',
      city: 'Yaoundé',
      region: 'Centre',
      postalCode: '00237',
      lat: 3.8667,
      lng: 11.5167,
    },
  });

  // Create sample order
  await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-sample01`,
      userId: user.id,
      status: 'paid',
      fulfillment: 'delivery',
      addressId: address1.id,
      subtotalCents: croissant.priceCents + pain.priceCents,
      deliveryFeeCents: 5000,
      taxCents: Math.floor((croissant.priceCents + pain.priceCents) * 0.05),
      totalCents: croissant.priceCents + pain.priceCents + 5000 + Math.floor((croissant.priceCents + pain.priceCents) * 0.05),
      paymentStatus: 'successful',
      items: {
        create: [
          {
            productId: croissant.id,
            productSnapshot: croissant,
            quantity: 2,
            unitPriceCents: croissant.priceCents,
            totalCents: croissant.priceCents * 2,
          },
          {
            productId: pain.id,
            productSnapshot: pain,
            quantity: 1,
            unitPriceCents: pain.priceCents,
            totalCents: pain.priceCents,
          },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('Admin:', admin.email, '/ admin123');
  console.log('User:', user.email, '/ user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
