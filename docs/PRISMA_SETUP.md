# Prisma Setup & Migrations

## Initialize Prisma (Already Done)

The Prisma files have been set up with:
- `src/prisma/schema.prisma` - Database schema
- Package.json with @prisma/client dependency

## First Time Setup

### 1. Create Database
```bash
# Local PostgreSQL
sudo -u postgres createdb patisserie_db
# Or use Docker: docker-compose up -d db

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/patisserie_db
```

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Create Initial Migration
```bash
npm run prisma:migrate
# This creates: prisma/migrations/[timestamp]_init/migration.sql
```

### 4. Seed Sample Data (Optional)
```bash
npm run prisma:seed
# Creates admin + sample products + orders
```

## Schema Overview

### Core Tables

**users** - User accounts & auth
```prisma
User {
  id          String (UUID)
  email       String @unique
  passwordHash String
  fullName    String?
  phone       String?
  isAdmin     Boolean (default: false)
  orders      Order[] (relation)
  addresses   Address[] (relation)
}
```

**products** - Product catalog
```prisma
Product {
  id          String (UUID)
  name        String
  slug        String @unique
  description String
  priceCents  Int      (e.g., 2500 = 25.00 XAF)
  stock       Int
  isActive    Boolean
  metadata    Json     (flexible attributes)
  images      ProductImage[]
  orderItems  OrderItem[]
}
```

**orders** - Customer orders
```prisma
Order {
  id              String
  orderNumber     String @unique (ORD-timestamp-random)
  userId          String? (nullable for guest)
  status          String  (pending|paid|preparing|ready|shipped|cancelled)
  fulfillment     String  (delivery|pickup)
  subtotalCents   Int
  deliveryFeeCents Int
  taxCents        Int
  totalCents      Int
  paymentStatus   String
  items           OrderItem[]
  payments        Payment[]
}
```

**order_items** - Line items in orders
```prisma
OrderItem {
  productId       String (FK)
  orderId         String (FK)
  productSnapshot Json (immutable snapshot)
  quantity        Int
  unitPriceCents  Int
  totalCents      Int
}
```

**payments** - Payment transactions (for future integration)
```prisma
Payment {
  id              String
  orderId         String (FK)
  provider        String (flutterwave|cinetpay)
  providerPaymentId String
  amount          Int
  status          String (initiated|successful|failed)
  metadata        Json
}
```

## Common Prisma Commands

```bash
# Generate/update Prisma client
npm run prisma:generate

# Create a new migration (after schema changes)
npm run prisma:migrate
# Prompts for migration name: "add wallet field", etc.

# Push schema changes to DB (no migration file)
npx prisma db push

# Reset database (careful - deletes all data!)
npx prisma db push -- --force-reset

# Manual seed
npm run prisma:seed

# Open Prisma Studio (GUI for database)
npm run prisma:studio
# Browser opens on http://localhost:5555

# List migrations
npx prisma migrate status

# Rollback last migration (dev env only)
npx prisma migrate resolve --rolled-back migration-name
```

## Using Prisma in Code

### Example: Create Order
```typescript
const order = await prisma.order.create({
  data: {
    orderNumber: `ORD-${Date.now()}`,
    userId: 'user-123',
    status: 'pending',
    fulfillment: 'delivery',
    items: {
      create: [
        {
          productId: 'prod-1',
          quantity: 2,
          unitPriceCents: 2500,
          totalCents: 5000,
        }
      ]
    }
  },
  include: { items: true }  // Eager load items
});
```

### Example: Find with Filters
```typescript
const activeProducts = await prisma.product.findMany({
  where: {
    isActive: true,
    stock: { gt: 0 }  // stock > 0
  },
  include: { images: true },
  orderBy: { name: 'asc' }
});
```

### Example: Update
```typescript
await prisma.product.update({
  where: { id: 'prod-1' },
  data: { stock: { decrement: 5 } }  // stock -= 5
});
```

### Example: Transaction
```typescript
// Multiple operations succeed or all fail
const result = await prisma.$transaction([
  prisma.order.create({ data: {...} }),
  prisma.product.update({ where: {...}, data: {...} })
]);
```

## Migrations in Production

### Deploy New Migration
```bash
npm run build
npm run prisma:migrate:prod  # Runs pending migrations
npm start                    # Start server
```

### Deployment Strategy
1. Test migration locally first
2. Backup production database
3. Run migration on production DB
4. Update code version
5. Restart server

### Rollback Plan (if needed)
- Always keep backup before migrations
- Document each migration purpose
- Test rollback script in staging env

## Troubleshooting

### "Column does not exist" error
→ Forgot to run migration after schema change
```bash
npm run prisma:migrate
```

### "Environment variable not found: DATABASE_URL"
→ Add to .env file
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Foreign key constraint error
→ Check relationships in schema.prisma
Use `onDelete: Cascade` or `SetNull` as needed

### Prisma Studio won't open
```bash
npx prisma studio --port 5556  # Try different port
```

---

**All migrations are created in** `prisma/migrations/`
**Never edit migration files manually** - they're generated by Prisma
