/**
 * Seed script for Chez Guigui - Complete product catalog
 * Extracted from real menu images (Pause Sucrée, Pause Salée, Pastels)
 * 
 * Pricing convention: priceCents / 100 = XAF
 * Example: 300000 priceCents = 3.000 FCFA
 * 
 * Usage: npx ts-node src/prisma/seed-catalog.ts
 */

import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const hashPassword = (password: string) => bcryptjs.hash(password, 12);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Chez Guigui catalog...\n');

  // ─── CLEAN ──────────────────────────────────────
  console.log('🗑️  Cleaning existing data...');
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.user.deleteMany();

  // ─── USERS ──────────────────────────────────────
  console.log('👤 Creating users...');
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@chezguigui.cm',
      passwordHash: adminPassword,
      fullName: 'Guigui Admin',
      phone: '+237693264991',
      isAdmin: true,
    },
  });

  const userPassword = await hashPassword('client123');
  const client = await prisma.user.create({
    data: {
      email: 'client@example.cm',
      passwordHash: userPassword,
      fullName: 'Marie Nguema',
      phone: '+237670000001',
    },
  });
  console.log(`  ✅ Admin: ${admin.email} / admin123`);
  console.log(`  ✅ Client: ${client.email} / client123`);

  // ─── PARENT CATEGORIES ─────────────────────────
  console.log('\n📁 Creating parent categories...');
  const pauseSucree = await prisma.category.create({
    data: {
      name: 'Pause Sucrée',
      slug: 'pause-sucree',
      description: 'Toutes nos douceurs sucrées : cakes, crêpes, pancakes, gaufres et beignets.',
      imageUrl: null,
      position: 1,
    },
  });
  const pauseSalee = await prisma.category.create({
    data: {
      name: 'Pause Salée',
      slug: 'pause-salee',
      description: 'Nos créations salées : crêpes garnies, pastels, gaufres salées et mini ardoises.',
      imageUrl: null,
      position: 2,
    },
  });

  // ─── SUB-CATEGORIES ────────────────────────────
  console.log('📂 Creating sub-categories...');
  const catCakes = await prisma.category.create({
    data: {
      name: 'Cakes',
      slug: 'cakes',
      description: 'Nos cakes faits maison, moelleux et savoureux, préparés chaque jour avec des ingrédients frais.',
      parentId: pauseSucree.id,
      position: 1,
    },
  });
  const catCrepesSucrees = await prisma.category.create({
    data: {
      name: 'Crêpes Sucrées',
      slug: 'crepes-sucrees',
      description: 'Crêpes fines et gourmandes avec garnitures au choix : Nutella, chocolat, confiture et plus encore.',
      parentId: pauseSucree.id,
      position: 2,
    },
  });
  const catCrepesSalees = await prisma.category.create({
    data: {
      name: 'Crêpes Salées',
      slug: 'crepes-salees',
      description: 'Crêpes garnies de jambon, fromage, viande hachée pour un repas complet et savoureux.',
      parentId: pauseSalee.id,
      position: 3,
    },
  });
  const catPancakes = await prisma.category.create({
    data: {
      name: 'Pancakes',
      slug: 'pancakes',
      description: 'Pancakes moelleux et généreux, nature ou garnis, parfaits pour le petit déjeuner et le goûter.',
      parentId: pauseSucree.id,
      position: 4,
    },
  });
  const catGaufresSucrees = await prisma.category.create({
    data: {
      name: 'Gaufres Sucrées',
      slug: 'gaufres-sucrees',
      description: 'Gaufres croustillantes et dorées, natures ou tartinées, en format classique ou mini cœurs.',
      parentId: pauseSucree.id,
      position: 5,
    },
  });
  const catGaufresSalees = await prisma.category.create({
    data: {
      name: 'Gaufres Salées',
      slug: 'gaufres-salees',
      description: 'Gaufres garnies de jambon et fromage pour une pause salée gourmande.',
      parentId: pauseSalee.id,
      position: 6,
    },
  });
  const catBeignets = await prisma.category.create({
    data: {
      name: 'Beignets',
      slug: 'beignets',
      description: 'Beignets traditionnels camerounais : soufflés, banane ou maïs, préparés à la commande.',
      parentId: pauseSucree.id,
      position: 7,
    },
  });
  const catPastels = await prisma.category.create({
    data: {
      name: 'Pastels',
      slug: 'pastels',
      description: 'Les incontournables pastels de Guigui, croustillants et dorés, viande, poisson ou végétariens.',
      parentId: pauseSalee.id,
      position: 8,
    },
  });
  const catMiniArdoises = await prisma.category.create({
    data: {
      name: 'Mini Ardoises',
      slug: 'mini-ardoises',
      description: 'Assortiment de minis salés parfaits pour les événements : nems, burgers, pizzas, quiches.',
      parentId: pauseSalee.id,
      position: 9,
    },
  });
  const catSupplements = await prisma.category.create({
    data: {
      name: 'Suppléments',
      slug: 'supplements',
      description: 'Accompagnements et extras pour personnaliser votre commande.',
      position: 10,
    },
  });
  const catDesserts = await prisma.category.create({
    data: {
      name: 'Desserts',
      slug: 'desserts',
      description: 'Verrines, tiramisu et desserts en pot préparés artisanalement. Gourmandise en format individuel.',
      parentId: pauseSucree.id,
      position: 11,
    },
  });
  const catYaourts = await prisma.category.create({
    data: {
      name: 'Yaourts & Boissons',
      slug: 'yaourts-boissons',
      description: 'Yaourts artisanaux en sachet et boissons fraîches maison. Le rafraîchissement made in Guigui.',
      parentId: pauseSucree.id,
      position: 12,
    },
  });

  // Helper to create product + link to category
  async function createProduct(
    data: {
      name: string;
      slug: string;
      description: string;
      priceCents: number;
      stock: number;
      isFeatured?: boolean;
      metadata?: Record<string, any>;
    },
    categoryId: string,
  ) {
    return prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        priceCents: data.priceCents,
        stock: data.stock,
        isActive: true,
        isFeatured: data.isFeatured ?? false,
        metadata: data.metadata ?? {},
        categories: { create: { categoryId } },
      },
    });
  }

  // ═══════════════════════════════════════════════
  //  CAKES (11 products)
  // ═══════════════════════════════════════════════
  console.log('\n🍰 Creating Cakes...');
  await createProduct({
    name: 'Cake Nature',
    slug: 'cake-nature',
    priceCents: 300000,
    description: 'Un cake moelleux et fondant, à la recette traditionnelle. Parfait pour accompagner votre thé ou café, ce classique indémodable ravira les amateurs de simplicité.',
    stock: 20,
    metadata: { tags: ['nature', 'classique', 'goûter', 'fait-maison'] },
  }, catCakes.id);

  await createProduct({
    name: 'Cake au Chocolat',
    slug: 'cake-chocolat',
    priceCents: 400000,
    description: 'Intense et irrésistible, notre cake au chocolat noir fondant est un péché mignon pour les amateurs de cacao. Texture dense et saveur profonde garanties.',
    stock: 20,
    isFeatured: true,
    metadata: { tags: ['chocolat', 'gourmand', 'premium', 'best-seller'] },
  }, catCakes.id);

  await createProduct({
    name: 'Cake au Citron',
    slug: 'cake-citron',
    priceCents: 350000,
    description: "Frais et acidulé, notre cake au citron est une explosion de saveurs en bouche. Son glaçage léger et son parfum d'agrumes en font un incontournable.",
    stock: 15,
    metadata: { tags: ['citron', 'frais', 'agrumes', 'léger'] },
  }, catCakes.id);

  await createProduct({
    name: 'Cake Velours',
    slug: 'cake-velours',
    priceCents: 400000,
    description: "Notre cake velours, d'une douceur incomparable, fond littéralement sur la langue. Sa texture soyeuse et son goût délicat en font un produit d'exception.",
    stock: 10,
    isFeatured: true,
    metadata: { tags: ['velours', 'premium', 'doux', 'raffiné'] },
  }, catCakes.id);

  await createProduct({
    name: "Cake à l'Orange",
    slug: 'cake-orange',
    priceCents: 350000,
    description: "Parfumé aux zestes d'orange fraîche, ce cake ensoleillé apporte une touche fruitée et vitaminée à votre pause gourmande.",
    stock: 15,
    metadata: { tags: ['orange', 'fruité', 'agrumes', 'vitaminé'] },
  }, catCakes.id);

  await createProduct({
    name: 'Cake à la Carotte',
    slug: 'cake-carotte',
    priceCents: 400000,
    description: 'Un cake moelleux aux carottes râpées et aux épices douces. Original et savoureux, il séduit par sa texture fondante et son goût subtilement sucré.',
    stock: 12,
    metadata: { tags: ['carotte', 'épices', 'original', 'sain'] },
  }, catCakes.id);

  await createProduct({
    name: 'Cake au Yaourt',
    slug: 'cake-yaourt',
    priceCents: 350000,
    description: "Le grand classique revisité par Guigui. Ultra moelleux grâce au yaourt, c'est le cake du quotidien que toute la famille adore.",
    stock: 20,
    metadata: { tags: ['yaourt', 'classique', 'familial', 'moelleux'] },
  }, catCakes.id);

  await createProduct({
    name: 'Cake Coco',
    slug: 'cake-coco',
    priceCents: 400000,
    description: 'Évadez-vous sous les tropiques avec notre cake à la noix de coco. Sa saveur exotique et sa texture fondante transportent vos papilles au paradis.',
    stock: 12,
    metadata: { tags: ['coco', 'tropical', 'exotique', 'gourmand'] },
  }, catCakes.id);

  await createProduct({
    name: 'Cake Marbré',
    slug: 'cake-marbre',
    priceCents: 350000,
    description: 'Le mariage parfait du chocolat et de la vanille dans un cake aux motifs hypnotiques. Deux saveurs, un seul plaisir.',
    stock: 18,
    metadata: { tags: ['marbré', 'chocolat', 'vanille', 'bicolore'] },
  }, catCakes.id);

  await createProduct({
    name: 'Cake Petite Choco',
    slug: 'cake-petite-choco',
    priceCents: 450000,
    description: 'Notre cake premium aux pépites de chocolat fondantes. Chaque bouchée est une explosion de chocolat pour les vrais gourmands.',
    stock: 10,
    isFeatured: true,
    metadata: { tags: ['chocolat', 'pépites', 'premium', 'intense'] },
  }, catCakes.id);

  await createProduct({
    name: 'Brownies (lot de 10)',
    slug: 'brownies-lot-10',
    priceCents: 350000,
    description: "Dix brownies fondants au chocolat intense, avec leur croûte croustillante et leur cœur moelleux. Idéaux pour partager ou pour les événements.",
    stock: 15,
    isFeatured: true,
    metadata: { tags: ['brownies', 'chocolat', 'lot', 'partage', 'événement'], quantity: 10 },
  }, catCakes.id);

  // ═══════════════════════════════════════════════
  //  CRÊPES SUCRÉES (9 products)
  // ═══════════════════════════════════════════════
  console.log('🥞 Creating Crêpes Sucrées...');
  await createProduct({
    name: 'Crêpes Natures (lot de 10)',
    slug: 'crepes-natures-10',
    priceCents: 150000,
    description: 'Dix crêpes fines et légères, disponibles en saveur menthe, vanille ou fraise. Parfaites pour un goûter simple et délicieux.',
    stock: 30,
    metadata: { tags: ['nature', 'menthe', 'vanille', 'fraise', 'lot'], flavors: ['menthe', 'vanille', 'fraise'], quantity: 10 },
  }, catCrepesSucrees.id);

  await createProduct({
    name: 'Crêpes Tartinées (lot de 10)',
    slug: 'crepes-tartinees-10',
    priceCents: 250000,
    description: "Dix crêpes généreusement tartinées de confiture ou de pâte à tartiner. Un pur moment de gourmandise à partager.",
    stock: 25,
    metadata: { tags: ['confiture', 'tartina', 'garni', 'lot'], toppings: ['confiture', 'tartina'], quantity: 10 },
  }, catCrepesSucrees.id);

  await createProduct({
    name: 'Crêpes Marbrées (lot de 5)',
    slug: 'crepes-marbrees-5',
    priceCents: 100000,
    description: 'Cinq crêpes aux motifs marbrés chocolat-vanille, aussi belles que bonnes. Un régal pour les yeux et les papilles.',
    stock: 25,
    metadata: { tags: ['marbré', 'chocolat', 'vanille', 'lot'], quantity: 5 },
  }, catCrepesSucrees.id);

  await createProduct({
    name: 'Crêpes Coco-Choco (lot de 5)',
    slug: 'crepes-coco-choco-5',
    priceCents: 200000,
    description: "Cinq crêpes au duo irrésistible noix de coco et chocolat. L'alliance tropicale qui fait fondre de plaisir.",
    stock: 20,
    metadata: { tags: ['coco', 'chocolat', 'tropical', 'lot'], quantity: 5 },
  }, catCrepesSucrees.id);

  await createProduct({
    name: "Crêpes à l'Orange (lot de 5)",
    slug: 'crepes-orange-5',
    priceCents: 100000,
    description: "Cinq crêpes parfumées à l'orange fraîche. Légères et fruitées, elles apportent un vent de fraîcheur à votre pause.",
    stock: 20,
    metadata: { tags: ['orange', 'fruité', 'léger', 'lot'], quantity: 5 },
  }, catCrepesSucrees.id);

  await createProduct({
    name: 'Crêpes Nutella Marbrées (lot de 5)',
    slug: 'crepes-nutella-marbrees-5',
    priceCents: 200000,
    description: 'Cinq crêpes marbrées garnies de Nutella. Le mariage parfait entre crêpe artistique et pâte à tartiner légendaire.',
    stock: 20,
    metadata: { tags: ['nutella', 'marbré', 'premium', 'lot'], quantity: 5 },
  }, catCrepesSucrees.id);

  await createProduct({
    name: 'Crêpes au Chocolat (lot de 5)',
    slug: 'crepes-chocolat-5',
    priceCents: 100000,
    description: 'Cinq crêpes au chocolat fondant pour les amateurs de cacao. Simple, efficace et terriblement addictif.',
    stock: 25,
    metadata: { tags: ['chocolat', 'classique', 'lot'], quantity: 5 },
  }, catCrepesSucrees.id);

  await createProduct({
    name: 'Crêpes au Nutella (lot de 5)',
    slug: 'crepes-nutella-5',
    priceCents: 150000,
    description: "Cinq crêpes garnies d'une couche généreuse de Nutella. Le goûter préféré des petits... et des grands !",
    stock: 30,
    isFeatured: true,
    metadata: { tags: ['nutella', 'gourmand', 'populaire', 'lot'], quantity: 5 },
  }, catCrepesSucrees.id);

  await createProduct({
    name: 'Crêpes Croquantes Premium (lot de 5)',
    slug: 'crepes-croquantes-premium-5',
    priceCents: 500000,
    description: "Cinq crêpes d'exception garnies de Ferrero Rocher, Kinder Bueno, Nutella, biscuits et Oreo. Le summum de la gourmandise chez Guigui.",
    stock: 10,
    isFeatured: true,
    metadata: { tags: ['premium', 'ferrero', 'kinder', 'oreo', 'luxe', 'best-seller'], toppings: ['Ferrero Rocher', 'Kinder Bueno', 'Nutella', 'Biscuits', 'Oreo'], quantity: 5 },
  }, catCrepesSucrees.id);

  // ═══════════════════════════════════════════════
  //  CRÊPES SALÉES (5 products)
  // ═══════════════════════════════════════════════
  console.log('🧀 Creating Crêpes Salées...');
  await createProduct({
    name: 'Crêpe au Jambon (lot de 5)',
    slug: 'crepe-jambon-5',
    priceCents: 250000,
    description: 'Cinq crêpes salées garnies de jambon de qualité. Un classique de la pause salée, simple et satisfaisant.',
    stock: 20,
    metadata: { tags: ['jambon', 'salé', 'classique', 'lot'], quantity: 5 },
  }, catCrepesSalees.id);

  await createProduct({
    name: 'Crêpe Jambon Fromage Béchamel (lot de 5)',
    slug: 'crepe-jambon-fromage-bechamel-5',
    priceCents: 300000,
    description: 'Cinq crêpes fondantes au jambon, fromage filant et sauce béchamel onctueuse. Le trio gagnant pour une pause salée inoubliable.',
    stock: 15,
    isFeatured: true,
    metadata: { tags: ['jambon', 'fromage', 'béchamel', 'gourmand', 'lot'], quantity: 5 },
  }, catCrepesSalees.id);

  await createProduct({
    name: 'Crêpe Viande Hachée (lot de 5)',
    slug: 'crepe-viande-hachee-5',
    priceCents: 250000,
    description: 'Cinq crêpes garnies de viande hachée assaisonnée. Copieuses et savoureuses, elles remplacent un vrai repas.',
    stock: 20,
    metadata: { tags: ['viande', 'hachée', 'copieux', 'repas', 'lot'], quantity: 5 },
  }, catCrepesSalees.id);

  await createProduct({
    name: 'Crêpe Viande Hachée Fromage (lot de 5)',
    slug: 'crepe-viande-hachee-fromage-5',
    priceCents: 350000,
    description: "Cinq crêpes à la viande hachée et au fromage fondant. Un duo salé irrésistible qui ne laisse personne indifférent.",
    stock: 15,
    metadata: { tags: ['viande', 'hachée', 'fromage', 'gourmand', 'lot'], quantity: 5 },
  }, catCrepesSalees.id);

  await createProduct({
    name: 'Crêpe Viande Hachée Fromage Jambon (lot de 5)',
    slug: 'crepe-viande-hachee-fromage-jambon-5',
    priceCents: 550000,
    description: 'Cinq crêpes ultra-garnies : viande hachée, fromage filant et jambon. La version complète pour les grands appétits.',
    stock: 10,
    isFeatured: true,
    metadata: { tags: ['viande', 'fromage', 'jambon', 'complet', 'premium', 'lot'], quantity: 5 },
  }, catCrepesSalees.id);

  // ═══════════════════════════════════════════════
  //  PANCAKES (4 products)
  // ═══════════════════════════════════════════════
  console.log('🥞 Creating Pancakes...');
  await createProduct({
    name: 'Pancakes Natures',
    slug: 'pancakes-natures',
    priceCents: 200000,
    description: 'Pancakes moelleux et aériens, disponibles en menthe, vanille ou fraise. Le petit déjeuner américain version Guigui.',
    stock: 25,
    metadata: { tags: ['nature', 'menthe', 'vanille', 'fraise', 'petit-déjeuner'], flavors: ['menthe', 'vanille', 'fraise'] },
  }, catPancakes.id);

  await createProduct({
    name: 'Pancakes Pépites de Chocolat (lot de 5)',
    slug: 'pancakes-pepites-chocolat-5',
    priceCents: 150000,
    description: 'Cinq pancakes parsemés de pépites de chocolat fondantes. Chaque bouchée est un festival de chocolat.',
    stock: 20,
    isFeatured: true,
    metadata: { tags: ['chocolat', 'pépites', 'gourmand', 'lot'], quantity: 5 },
  }, catPancakes.id);

  await createProduct({
    name: 'Pancakes au Raisin Sec (lot de 5)',
    slug: 'pancakes-raisin-sec-5',
    priceCents: 150000,
    description: 'Cinq pancakes moelleux aux raisins secs juteux. Une touche fruitée et naturelle pour votre pause sucrée.',
    stock: 20,
    metadata: { tags: ['raisin', 'fruité', 'naturel', 'lot'], quantity: 5 },
  }, catPancakes.id);

  await createProduct({
    name: 'Pancakes Fourrés au Nutella (lot de 5)',
    slug: 'pancakes-fourres-nutella-5',
    priceCents: 200000,
    description: "Cinq pancakes avec un cœur de Nutella coulant à l'intérieur. La surprise fondante qui fait sensation à chaque bouchée.",
    stock: 15,
    isFeatured: true,
    metadata: { tags: ['nutella', 'fourré', 'gourmand', 'surprise', 'lot'], quantity: 5 },
  }, catPancakes.id);

  // ═══════════════════════════════════════════════
  //  BEIGNETS (3 products)
  // ═══════════════════════════════════════════════
  console.log('🍩 Creating Beignets...');
  await createProduct({
    name: 'Beignets Soufflés',
    slug: 'beignets-souffles',
    priceCents: 250000,
    description: 'Les authentiques beignets soufflés camerounais, légers comme un nuage et dorés à la perfection. Un classique inoubliable de la street-food locale.',
    stock: 30,
    isFeatured: true,
    metadata: { tags: ['soufflé', 'traditionnel', 'camerounais', 'populaire', 'best-seller'], priceNote: 'à partir de' },
  }, catBeignets.id);

  await createProduct({
    name: 'Beignets Banane',
    slug: 'beignets-banane',
    priceCents: 150000,
    description: "Beignets à la banane plantain, croustillants à l'extérieur et fondants à l'intérieur. Le goût authentique du Cameroun.",
    stock: 25,
    metadata: { tags: ['banane', 'plantain', 'traditionnel', 'camerounais'], priceNote: 'à partir de' },
  }, catBeignets.id);

  await createProduct({
    name: 'Beignets Maïs',
    slug: 'beignets-mais',
    priceCents: 150000,
    description: 'Beignets de maïs croustillants à la recette traditionnelle camerounaise. Un snack savoureux pour toute la journée.',
    stock: 25,
    metadata: { tags: ['maïs', 'traditionnel', 'camerounais', 'snack'], priceNote: 'à partir de' },
  }, catBeignets.id);

  // ═══════════════════════════════════════════════
  //  GAUFRES SUCRÉES (4 products)
  // ═══════════════════════════════════════════════
  console.log('🧇 Creating Gaufres Sucrées...');
  await createProduct({
    name: 'Gaufres Natures (lot de 10)',
    slug: 'gaufres-natures-10',
    priceCents: 200000,
    description: 'Dix gaufres croustillantes et dorées, disponibles en menthe, vanille ou fraise. Parfaites pour les goûters et les fêtes.',
    stock: 20,
    metadata: { tags: ['nature', 'menthe', 'vanille', 'fraise', 'lot'], flavors: ['menthe', 'vanille', 'fraise'], quantity: 10 },
  }, catGaufresSucrees.id);

  await createProduct({
    name: 'Gaufres Tartinées (lot de 10)',
    slug: 'gaufres-tartinees-10',
    priceCents: 300000,
    description: 'Dix gaufres généreusement tartinées de Nutella, confiture ou pâte à tartiner. Le goûter gourmand par excellence.',
    stock: 15,
    metadata: { tags: ['tartinée', 'nutella', 'confiture', 'gourmand', 'lot'], quantity: 10 },
  }, catGaufresSucrees.id);

  await createProduct({
    name: 'Mini Cœurs Gaufres (lot de 10)',
    slug: 'mini-coeurs-gaufres-10',
    priceCents: 100000,
    description: "Dix adorables mini gaufres en forme de cœur. Parfaites pour les fêtes d'anniversaire et les cadeaux gourmands.",
    stock: 20,
    isFeatured: true,
    metadata: { tags: ['mini', 'cœur', 'mignon', 'événement', 'cadeau', 'lot'], quantity: 10 },
  }, catGaufresSucrees.id);

  await createProduct({
    name: 'Mini Cœurs Gaufres Tartinés (lot de 10)',
    slug: 'mini-coeurs-gaufres-tartines-10',
    priceCents: 200000,
    description: 'Dix mini gaufres cœur tartinées de chocolat ou confiture. Irrésistibles et parfaites en coffret cadeau.',
    stock: 15,
    metadata: { tags: ['mini', 'cœur', 'tartinée', 'cadeau', 'lot'], quantity: 10 },
  }, catGaufresSucrees.id);

  // ═══════════════════════════════════════════════
  //  GAUFRES SALÉES (1 product)
  // ═══════════════════════════════════════════════
  console.log('🧇 Creating Gaufres Salées...');
  await createProduct({
    name: 'Gaufre Jambon Fromage (lot de 5)',
    slug: 'gaufre-jambon-fromage-5',
    priceCents: 350000,
    description: "Cinq gaufres salées garnies de jambon et de fromage fondant. L'alliance croustillante et fondante pour une pause salée unique.",
    stock: 15,
    isFeatured: true,
    metadata: { tags: ['jambon', 'fromage', 'salé', 'croustillant', 'lot'], quantity: 5 },
  }, catGaufresSalees.id);

  // ═══════════════════════════════════════════════
  //  MINI ARDOISES (5 products)
  // ═══════════════════════════════════════════════
  console.log('🍔 Creating Mini Ardoises...');
  await createProduct({
    name: 'Nems Viande (lot de 10)',
    slug: 'nems-viande-10',
    priceCents: 150000,
    description: 'Dix nems croustillants à la viande, parfaits pour les apéritifs et les événements.',
    stock: 20,
    metadata: { tags: ['nems', 'viande', 'apéritif', 'événement', 'lot'], quantity: 10 },
  }, catMiniArdoises.id);

  await createProduct({
    name: 'Boulettes de Viande + Plantains Frits (lot de 10)',
    slug: 'boulettes-viande-plantains-10',
    priceCents: 300000,
    description: 'Dix boulettes de viande moelleuses accompagnées de plantains frits dorés. Un duo camerounais savoureux et généreux.',
    stock: 15,
    isFeatured: true,
    metadata: { tags: ['boulette', 'viande', 'plantain', 'camerounais', 'lot'], quantity: 10, includes: 'plantains frits' },
  }, catMiniArdoises.id);

  await createProduct({
    name: 'Mini Burgers (lot de 10)',
    slug: 'mini-burgers-10',
    priceCents: 500000,
    description: "Dix mini burgers gourmands. Idéaux pour les fêtes, anniversaires et cocktails entre amis.",
    stock: 10,
    isFeatured: true,
    metadata: { tags: ['burger', 'mini', 'événement', 'fête', 'anniversaire', 'lot'], quantity: 10 },
  }, catMiniArdoises.id);

  await createProduct({
    name: 'Mini Pizzas (lot de 10)',
    slug: 'mini-pizzas-10',
    priceCents: 500000,
    description: 'Dix mini pizzas garnies et gratinées, parfaites pour les réceptions.',
    stock: 10,
    metadata: { tags: ['pizza', 'mini', 'événement', 'fête', 'fromage', 'lot'], quantity: 10 },
  }, catMiniArdoises.id);

  await createProduct({
    name: 'Mini Quiches Lorraines (lot de 10)',
    slug: 'mini-quiches-lorraines-10',
    priceCents: 500000,
    description: "Dix mini quiches lorraines au jambon et fromage. L'élégance française pour vos réceptions.",
    stock: 10,
    metadata: { tags: ['quiche', 'lorraine', 'mini', 'événement', 'élégant', 'lot'], quantity: 10 },
  }, catMiniArdoises.id);

  // ═══════════════════════════════════════════════
  //  PASTELS (4 products)
  // ═══════════════════════════════════════════════
  console.log('🥟 Creating Pastels...');
  await createProduct({
    name: 'Pastel Viande Hachée (lot de 5)',
    slug: 'pastel-viande-hachee-5',
    priceCents: 100000,
    description: "Cinq pastels dorés et croustillants garnis de viande hachée assaisonnée. L'incontournable snack camerounais signé Guigui.",
    stock: 30,
    isFeatured: true,
    metadata: { tags: ['pastel', 'viande', 'croustillant', 'camerounais', 'populaire'], quantity: 5 },
  }, catPastels.id);

  await createProduct({
    name: 'Pastel Viande Hachée Fromage (lot de 5)',
    slug: 'pastel-viande-hachee-fromage-5',
    priceCents: 150000,
    description: 'Cinq pastels croustillants à la viande hachée et au fromage fondant. La version premium de notre best-seller.',
    stock: 25,
    isFeatured: true,
    metadata: { tags: ['pastel', 'viande', 'fromage', 'premium', 'best-seller'], quantity: 5 },
  }, catPastels.id);

  await createProduct({
    name: 'Pastel Poisson Haché (lot de 5)',
    slug: 'pastel-poisson-hache-5',
    priceCents: 100000,
    description: 'Cinq pastels au poisson haché finement assaisonné. Une alternative délicate à la version viande.',
    stock: 20,
    metadata: { tags: ['pastel', 'poisson', 'léger', 'alternatif'], quantity: 5 },
  }, catPastels.id);

  await createProduct({
    name: 'Pastel Végétarien (lot de 5)',
    slug: 'pastel-vegetarien-5',
    priceCents: 100000,
    description: "Cinq pastels garnis de légumes frais assaisonnés. La version végétarienne aussi gourmande que l'originale.",
    stock: 20,
    metadata: { tags: ['pastel', 'végétarien', 'légumes', 'sain', 'vert'], quantity: 5 },
  }, catPastels.id);

  // ═══════════════════════════════════════════════
  //  SUPPLÉMENTS (2 products)
  // ═══════════════════════════════════════════════
  console.log('➕ Creating Suppléments...');
  await createProduct({
    name: 'Supplément Pomme de Terre',
    slug: 'supplement-pomme-de-terre',
    priceCents: 25000,
    description: 'Pomme de terre en accompagnement pour vos pastels.',
    stock: 50,
    metadata: { tags: ['supplément', 'accompagnement', 'pomme-de-terre'], type: 'supplement' },
  }, catSupplements.id);

  await createProduct({
    name: 'Supplément Œuf Dur',
    slug: 'supplement-oeuf-dur',
    priceCents: 25000,
    description: 'Œuf dur en accompagnement pour vos pastels.',
    stock: 50,
    metadata: { tags: ['supplément', 'accompagnement', 'œuf'], type: 'supplement' },
  }, catSupplements.id);

  // ═══════════════════════════════════════════════
  //  DESSERTS (3 products)
  // ═══════════════════════════════════════════════
  console.log('🍮 Creating Desserts...');
  await createProduct({
    name: 'Verrine Oreo',
    slug: 'verrine-oreo',
    priceCents: 200000,
    description: "Une verrine gourmande avec une crème onctueuse et des biscuits Oreo émiettés en couches alternées. Un dessert individuel irrésistible qui allie croquant et fondant.",
    stock: 20,
    isFeatured: true,
    metadata: { tags: ['verrine', 'oreo', 'crème', 'dessert', 'individuel', 'premium'], toppings: ['Oreo', 'crème vanille'] },
  }, catDesserts.id);

  await createProduct({
    name: 'Verrine Chocolat',
    slug: 'verrine-chocolat',
    priceCents: 200000,
    description: 'Verrine au chocolat avec mousse légère et copeaux croquants. Un dessert raffiné en format individuel, parfait pour se faire plaisir.',
    stock: 15,
    metadata: { tags: ['verrine', 'chocolat', 'mousse', 'dessert', 'individuel'], toppings: ['chocolat', 'copeaux'] },
  }, catDesserts.id);

  await createProduct({
    name: 'Verrine Fruits',
    slug: 'verrine-fruits',
    priceCents: 250000,
    description: 'Verrine aux fruits frais de saison sur lit de crème pâtissière. Fraîcheur et gourmandise dans un pot transparent qui met en valeur les couleurs.',
    stock: 12,
    metadata: { tags: ['verrine', 'fruits', 'frais', 'saison', 'dessert'], toppings: ['fruits de saison', 'crème pâtissière'] },
  }, catDesserts.id);

  // ═══════════════════════════════════════════════
  //  YAOURTS & BOISSONS (3 products)
  // ═══════════════════════════════════════════════
  console.log('🥛 Creating Yaourts & Boissons...');
  await createProduct({
    name: 'Yaourt Artisanal Nature (sachet)',
    slug: 'yaourt-artisanal-nature',
    priceCents: 25000,
    description: "Yaourt frais fait maison, onctueux et naturel, conditionné en sachet traditionnel. Fabriqué chaque jour avec du lait frais local, c'est le rafraîchissement préféré des Camerounais.",
    stock: 100,
    isFeatured: true,
    metadata: { tags: ['yaourt', 'nature', 'frais', 'artisanal', 'sachet', 'traditionnel', 'best-seller'], packaging: 'sachet', unit: 'individuel' },
  }, catYaourts.id);

  await createProduct({
    name: 'Yaourt Artisanal Sucré (sachet)',
    slug: 'yaourt-artisanal-sucre',
    priceCents: 30000,
    description: 'Yaourt artisanal légèrement sucré en sachet. La même onctuosité que notre nature, avec une touche de douceur pour les gourmands.',
    stock: 100,
    metadata: { tags: ['yaourt', 'sucré', 'frais', 'artisanal', 'sachet'], packaging: 'sachet', unit: 'individuel' },
  }, catYaourts.id);

  await createProduct({
    name: 'Yaourt Artisanal (lot de 10)',
    slug: 'yaourt-artisanal-lot-10',
    priceCents: 200000,
    description: 'Dix sachets de yaourt artisanal frais. Le format économique idéal pour les familles, les bureaux ou les événements.',
    stock: 50,
    isFeatured: true,
    metadata: { tags: ['yaourt', 'lot', 'économique', 'famille', 'événement'], packaging: 'sachet', quantity: 10 },
  }, catYaourts.id);

  // ─── SAMPLE ADDRESS ────────────────────────────
  console.log('\n📍 Creating sample address...');
  await prisma.address.create({
    data: {
      userId: client.id,
      label: 'Maison',
      street: 'Quartier Bastos, Rue 1.234',
      city: 'Yaoundé',
      region: 'Centre',
      postalCode: '00237',
      lat: 3.8667,
      lng: 11.5167,
    },
  });

  // ─── SUMMARY ───────────────────────────────────
  const totalProducts = await prisma.product.count();
  const totalCategories = await prisma.category.count();
  const totalFeatured = await prisma.product.count({ where: { isFeatured: true } });

  console.log(`\n${'═'.repeat(50)}`);
  console.log('🎉 SEED COMPLETE — Chez Guigui Catalog');
  console.log(`${'═'.repeat(50)}`);
  console.log(`  📦 ${totalProducts} products`);
  console.log(`  ⭐ ${totalFeatured} featured`);
  console.log(`  📁 ${totalCategories} categories (2 parents)`);
  console.log(`  👤 Admin: ${admin.email} / admin123`);
  console.log(`  👤 Client: ${client.email} / client123`);
  console.log(`  💰 Price range: 250 — 5.500 FCFA (54 products)`);
  console.log(`${'═'.repeat(50)}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
