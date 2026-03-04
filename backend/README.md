# Backend - Patisserie API

Express.js + PostgreSQL + Prisma + JWT

## Setup & Installation

### 1️⃣ Prerequisites
- Node.js 18+ / npm 9+
- PostgreSQL 14+ (ou Docker)
- Git

### 2️⃣ Environment Setup

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - DATABASE_URL=postgresql://user:password@localhost:5432/patisserie_db
# - JWT_SECRET=your_secret_key
# - JWT_REFRESH_SECRET=your_refresh_secret
```

### 3️⃣ Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database with sample data
npm run prisma:seed
```

### 4️⃣ Development Server

```bash
npm run dev
```

Server runs on `http://localhost:4000`

## Docker Setup

### Using Docker Compose (Recommended)

```bash
# Start PostgreSQL + Backend
docker-compose up -d

# Run migrations
docker-compose exec backend npm run prisma:migrate

# View logs
docker-compose logs -f backend
```

## Project Structure

```
src/
├── config/          # Configuration (env, database)
├── middleware/      # Auth, error handling
├── routes/          # Route definitions
├── controllers/     # Request handlers
├── services/        # Business logic
├── types/           # TypeScript types & DTOs
├── utils/           # JWT, errors, responses
├── prisma/          # Database schema
└── server.ts        # Express app entry point
```

## API Routes

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - List all products (public)
- `GET /api/products/:slug` - Get product by slug (public)
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `POST /api/products/:id/images` - Add product image (admin)

### Orders
- `POST /api/orders` - Create order (auth required)
- `GET /api/orders` - Get user's orders (auth required)
- `GET /api/orders/:id` - Get order details (auth required)

### Admin
- `GET /api/admin/orders` - Get all orders (admin)
- `PATCH /api/admin/orders/:id/status` - Update order status (admin)
- `GET /api/admin/stats` - Get dashboard stats (admin)

## Authentication

- Access tokens expire after 15 minutes
- Refresh tokens stored in HttpOnly cookies (7 days)
- JWT payload includes: `id`, `email`, `isAdmin`

### Authorization Header
```
Authorization: Bearer <access_token>
```

## Database Schema

See `src/prisma/schema.prisma` for full schema.

Key tables:
- `users` - User accounts
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment records (future)
- `addresses` - Delivery addresses

## Security Features

✅ Helmet - HTTP headers security
✅ CORS - Cross-origin protection
✅ Rate limiting - DDoS prevention (100 req/15min)
✅ JWT - Secure token-based auth
✅ bcryptjs - Password hashing (12 rounds)
✅ Input validation - DTO validation
✅ SQL injection protection - Prisma parameterized queries
✅ HTTPS ready - SSL/TLS support

## Building for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm test:watch
```

## Linting

```bash
npm run lint
```

## Deployment

### Environment Variables (Production)
```
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:prod_password@prod_host:5432/patisserie_db
JWT_SECRET=<very_long_random_string>
JWT_REFRESH_SECRET=<another_very_long_random_string>
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
PORT=4000
API_BASE_URL=https://api.patisserie.cm
FRONTEND_URL=https://patisserie.cm
CORS_ORIGIN=https://patisserie.cm
```

### Docker Production Build

```bash
docker build -t patisserie-backend:1.0.0 .
docker run -d \
  --name patisserie-api \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  -p 4000:4000 \
  patisserie-backend:1.0.0
```

### Best Practices
- Use environment variables for all secrets
- Enable HTTPS in production
- Set up database backups
- Monitor logs and errors (Sentry, LogRocket)
- Implement rate limiting at reverse proxy (nginx)
- Use strong JWT secrets (min 32 chars)
- Keep dependencies updated

## Troubleshooting

### Database connection error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
→ Check PostgreSQL is running and DATABASE_URL is correct

### Prisma migration issues
```
npm run prisma:migrate -- --force  # Force migration (dev only)
npx prisma db push                  # Push schema without migration
```

### Port already in use
```
# Change PORT in .env or kill process on port 4000
lsof -i :4000
kill -9 <PID>
```

## Support & Next Steps

- Implement payment gateway integration (Flutterwave/CinetPay)
- Add email notifications (nodemailer)
- Implement order tracking
- Add file upload service (AWS S3)
- Set up CI/CD pipeline (GitHub Actions)
