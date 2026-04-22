# Architecture & Setup Guide - Backend Express

## 🏗️ Architecture Overview

```
CLIENT (Next.js)
       ↓
   HTTPS/TLS
       ↓
  API Gateway/Reverse Proxy (nginx in prod)
       ↓
Express Server
├── Middleware (Auth, Validation, Error)
├── Routes (Auth, Products, Orders, Admin)
├── Controllers (Request handlers)
├── Services (Business logic)
└── Database (PostgreSQL via Prisma)
```

## 📂 Folder Structure Explained

### `src/config/`
- `env.ts` - Centralized environment variables
- `database.ts` - Prisma client singleton

### `src/middleware/`
- `auth.ts` - JWT authentication & authorization
- `errorHandler.ts` - Global error handling

### `src/routes/`
- Public & authenticated route definitions
- Route protection via middleware

### `src/controllers/`
- Request handlers → call services
- Input validation → send responses
- No business logic here

### `src/services/`
- Core business logic
- Database operations via Prisma
- Error throwing for controllers to handle

### `src/types/`
- TypeScript interfaces & DTOs
- Request/response shapes

### `src/utils/`
- JWT token generation/validation
- Error classes
- Response helpers

### `src/prisma/`
- `schema.prisma` - Database schema & ORM config
- `seed.ts` - Sample data for development

## 🔐 Security Implementation

### 1. Authentication Flow
```
POST /auth/login
  ↓
Verify email + password (bcryptjs)
  ↓
Generate access token (15 min) + refresh token (7 days)
  ↓
Return accessToken + store refreshToken in HttpOnly cookie
```

### Accessing Protected Routes
```
GET /api/orders
Header: Authorization: Bearer <accessToken>
  ↓
Middleware validates token
  ↓
User data available in req.user
```

### 2. Password Security
- Hashed with bcryptjs (12 rounds)
- Never stored in plain text
- Compared using bcryptjs.compare()

### 3. Database Security
- Prisma parameterized queries (prevents SQL injection)
- Foreign key constraints
- Soft deletes on products (isActive flag)

### 4. Rate Limiting
- 100 requests per 15 minutes (general)
- 5 login attempts per 15 minutes (auth)
- Can be stricter in production

### 5. HTTP Headers (Helmet)
```
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP)
```

## 🗄️ Database Design

### Key Concepts

**Users Table**
- Stores credentials + profile
- `isAdmin` flag for role-based access
- Updated automatic timestamps

**Products Table**
- `priceCents` (integer) - prevents float rounding errors
  - 2500 cents = 25.00 XAF
- `stock` tracked for inventory
- `isActive` for soft deletes
- `metadata` JSON for flexible product attributes

**Orders Table**
- `orderNumber` - human-readable ID (ORD-1708456789-abc123)
- `status` enum - tracks order lifecycle
- `fulfillment` - delivery vs pickup logic
- All prices in cents for precision
- `paymentStatus` - separate from order status

**OrderItems Table**
- `productSnapshot` JSON - immutable order snapshot
  - Protects against product price/name changes
- Links to products for stock management

**Payments Table** (ready for Flutterwave/CinetPay)
- `provider` - Flutterwave, CinetPay, etc.
- `providerPaymentId` - external payment gateway ID
- `metadata` - store webhook data

## 🚀 Development Workflow

### 1. Setup
```bash
npm install
npm run prisma:migrate        # Run migrations
npm run prisma:seed           # Load sample data
npm run dev                   # Start dev server
```

### 2. After Schema Changes
```bash
# Edit src/prisma/schema.prisma
npm run prisma:migrate        # Creates migration
npm run prisma:seed           # Re-seed if needed
```

### 3. Testing API
```bash
# Manual testing with curl
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@patisserie.cm","password":"user123"}'

# Returns: { user, accessToken }

# Use token in requests
curl http://localhost:4000/api/orders \
  -H "Authorization: Bearer <accessToken>"
```

## 📝 Common API Patterns

### Response Format (Success)
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": { ... },
  "timestamp": "2024-02-20T10:30:00.000Z"
}
```

### Response Format (Error)
```json
{
  "success": false,
  "message": "Insufficient stock for product",
  "error": "Insufficient stock for product",
  "timestamp": "2024-02-20T10:30:00.000Z"
}
```

## 🔧 Key Configuration

### JWT Secrets (Must be changed!)
Production secrets should be:
- Long (32+ characters)
- Random
- Stored in secure vault (HashiCorp Vault, AWS Secrets Manager)

### Environment Tiers
```
.env                → local development
.env.example        → template (no secrets)
.env.production     → production (not in git)
```

### CORS Configuration
In production, only allow your frontend domain:
```
CORS_ORIGIN=https://patisserie.cm
```

## 🌐 Deployment Checklist

- [ ] Change JWT secrets
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/TLS
- [ ] Configure database URL (managed database service)
- [ ] Set up database backups
- [ ] Configure CORS properly
- [ ] Add logging/monitoring (Sentry)
- [ ] Set up CI/CD (GitHub Actions)
- [ ] Test all endpoints before going live

## 🐛 Debugging

### Enable detailed logging
```typescript
// In server.ts
if (isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

### Check JWT token
```bash
# Decode token at jwt.io
# Or in Node:
const jwt = require('jsonwebtoken');
jwt.decode('<token>', {complete: true});
```

### Database query logs
```bash
npm run prisma:studio  # Interactive GUI for database
```

## 📚 Next Steps

1. **Payment Integration** - Hook up Flutterwave/CinetPay webhooks
2. **Email Notifications** - nodemailer for order confirmations
3. **File Uploads** - S3 for product images
4. **Caching** - Redis for product catalog
5. **Job Queue** - BullMQ for async tasks
6. **Analytics** - Track orders, revenue trends

---

**Need help?** Check the main README.md for quick commands.
