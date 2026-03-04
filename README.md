# 🎂 Patisserie E-Commerce Platform

Complete production-ready e-commerce platform for pastry business in Cameroon.

**Status**: ✅ Phase 1-4 Complete | ⏳ Phase 5 Pending (Figma designs)

---

## 📋 Quick Links

### Documentation
- [Architecture Overview](./ARCHITECTURE.md) - System design & components
- [Deployment Guide](./DEPLOYMENT.md) - Production setup (VPS, DB, SSL)
- [CI/CD & Monitoring](./CI_CD_AND_MONITORING.md) - GitHub Actions, Sentry, backups
- [Payment Integration](./backend/PAYMENT_INTEGRATION.md) - Flutterwave + CinetPay
- [Scaling Guide](./SCALING_GUIDE.md) - Growth to 10k+ users
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre-launch verification

### Source Code
- **Backend**: `backend/` (Express.js + PostgreSQL + Prisma)
- **Frontend**: `frontend/` (Next.js 14 + React 18 + Tailwind)

---

## 🚀 Quick Start

### Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Visit:
# Frontend: http://localhost:3000
# API: http://localhost:4000
# Docs: http://localhost:4000/api-docs
```

### Production

```bash
# Set environment variables
cp .env.example .env.prod
nano .env.prod

# Deploy
chmod +x deploy.sh
./deploy.sh

# Verify
curl https://api.patisserie.cm/health
```

---

## 📦 What's Included

### ✅ Phase 1: Architecture
- System design with diagrams
- Folder structure optimization
- Security guidelines
- Database schema (10 tables)

### ✅ Phase 2: Frontend
- **Pages**: Homepage, Products, Cart, Checkout, Login, Register, Admin Dashboard
- **Payment Flow**: Provider selection, callback handling, order details
- **State Management**: Zustand (auth + cart stores)
- **UI Components**: Header, Footer, Product Card, Layout
- **Features**: 
  - Product browsing with pagination
  - Shopping cart management
  - Responsive mobile design
  - Network retry logic for unstable connections

### ✅ Phase 3: Payment Integration
- **Flutterwave Integration**: Payment initialization, callback, webhook
- **CinetPay Integration**: Payment initialization, callback, webhook
- **Security**: Signature validation, SSL verification
- **Status Tracking**: Order payment timeline
- **Test Credentials**: Provided in documentation

### ✅ Phase 4: Production Setup
- **CI/CD Pipeline**: GitHub Actions (test → build → deploy)
- **Docker**: Multi-stage builds + postgres service container
- **Nginx Reverse Proxy**: SSL termination, rate limiting, security headers
- **Monitoring**: Sentry for error tracking + performance
- **Backup Automation**: Daily database backups + S3 upload
- **Environment Management**: Secrets, config validation
- **Scaling Guide**: From 500 to 10k+ concurrent users

### ⏳ Phase 5: Pending
- Frontend refinement based on Figma mockups (awaiting Figma link)
- Component design adjustments
- Animation additions
- Accessibility improvements

---

## 🛠️ Technology Stack

### Backend
```
Express.js 4.18                # HTTP server
Node.js 20                     # JavaScript runtime
TypeScript 5                   # Type safety
PostgreSQL 16                  # Database
Prisma 5.7                     # ORM
JWT                            # Authentication
bcryptjs                       # Password hashing
Axios                          # HTTP client
Sentry                         # Error monitoring
Helmet                         # Security headers
CORS                           # Cross-origin requests
```

### Frontend
```
Next.js 14                     # React framework
React 18                       # UI library
TypeScript 5                   # Type safety
Tailwind CSS 3                 # Styling
Zustand                        # State management
Axios                          # HTTP client
```

### Infrastructure
```
Docker                         # Containerization
Docker Compose                 # Service orchestration
Nginx                          # Reverse proxy
PostgreSQL                     # Managed database
GitHub Actions                 # CI/CD
Vercel                         # Frontend deployment
Sentry                         # Error tracking
```

---

## 📁 Project Structure

```
patisserie/
├── backend/
│   ├── src/
│   │   ├── server.ts                 # Express app entry
│   │   ├── config/
│   │   │   ├── database.ts           # Prisma client
│   │   │   ├── sentry.ts             # Error tracking
│   │   │   ├── env.ts                # Environment
│   │   │   └── config.ts             # Configuration validation
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT verification
│   │   │   ├── errorHandler.ts       # Global error handling
│   │   │   └── validation.ts         # Request validation
│   │   ├── services/
│   │   │   ├── authService.ts        # Register, login
│   │   │   ├── productService.ts     # Product CRUD
│   │   │   ├── orderService.ts       # Order management
│   │   │   └── paymentService.ts     # Flutterwave + CinetPay
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── productController.ts
│   │   │   ├── orderController.ts
│   │   │   ├── adminController.ts
│   │   │   └── paymentController.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── productRoutes.ts
│   │   │   ├── orderRoutes.ts
│   │   │   ├── adminRoutes.ts
│   │   │   └── paymentRoutes.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma         # Database schema
│   │   └── types/
│   │       └── index.ts              # TypeScript interfaces
│   ├── Dockerfile                    # Production build
│   ├── docker-compose.yml            # Local development
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.tsx             # Homepage
│   │   │   ├── products.tsx          # Product listing
│   │   │   ├── cart.tsx              # Shopping cart
│   │   │   ├── checkout.tsx          # Order creation
│   │   │   ├── payment.tsx           # Payment provider
│   │   │   ├── orders/[id].tsx       # Order details
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx
│   │   │   │   └── register.tsx
│   │   │   ├── admin/
│   │   │   │   └── dashboard.tsx
│   │   │   ├── _app.tsx              # App wrapper
│   │   │   └── _document.tsx         # HTML template
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── ProductCard.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useNetworkRetry.ts
│   │   ├── lib/
│   │   │   ├── authStore.ts          # Zustand auth store
│   │   │   ├── cartStore.ts          # Zustand cart store
│   │   │   └── utils.ts              # Helpers
│   │   ├── services/
│   │   │   └── api.ts                # Axios client
│   │   ├── styles/
│   │   │   └── globals.css           # Tailwind + custom CSS
│   │   └── types/
│   │       └── index.ts              # TypeScript interfaces
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── .eslintrc.json
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml                 # GitHub Actions pipeline
│
├── Documentation/
│   ├── ARCHITECTURE.md               # System design
│   ├── DEPLOYMENT.md                 # Production setup
│   ├── CI_CD_AND_MONITORING.md      # GitHub Actions, Sentry
│   ├── SCALING_GUIDE.md              # Growth strategy
│   ├── DEPLOYMENT_CHECKLIST.md       # Pre-launch
│   └── PAYMENT_INTEGRATION.md        # Payment providers
│
├── docker-compose.yml                # Local dev environment
├── docker-compose.prod.yml           # Production environment
├── nginx.conf                        # Nginx reverse proxy
├── deploy.sh                         # Deployment script
├── backup.sh                         # Database backup script
└── README.md                         # This file
```

---

## 🔐 Security Features

✅ **Authentication**
- JWT tokens (15 min access + 7 day refresh)
- HttpOnly secure cookies
- Password hashing with bcryptjs (12 rounds)
- Email validation on registration

✅ **Authorization**
- Admin role checking
- Resource ownership validation
- Rate limiting on sensitive endpoints

✅ **Network Security**
- HTTPS/SSL enforcement
- CORS whitelist
- Helmet security headers
- XSS protection
- CSRF protection

✅ **Data Protection**
- Prisma ORM (SQL injection prevention)
- Input validation on all endpoints
- Password reset via email token
- Soft deletes for data recovery

✅ **Payment Security**
- Signature verification for webhooks
- Amount verification before payment
- Immutable order item snapshots
- Transaction logging

---

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/register           # User registration
POST   /api/auth/login              # User login
POST   /api/auth/logout             # User logout
GET    /api/auth/me                 # Current user profile
POST   /api/auth/refresh            # Refresh token
```

### Products
```
GET    /api/products                # List all products (paginated)
GET    /api/products/:slug          # Get product by slug
POST   /api/admin/products          # Create product (admin)
PUT    /api/admin/products/:id      # Update product (admin)
DELETE /api/admin/products/:id      # Delete product (admin)
```

### Orders
```
POST   /api/orders                  # Create order
GET    /api/orders                  # List user orders
GET    /api/orders/:id              # Get order details
GET    /api/admin/orders            # List all orders (admin)
GET    /api/admin/orders/stats      # Dashboard stats (admin)
```

### Payments
```
POST   /api/payments/initiate       # Initiate payment
GET    /api/payments/:orderId       # Get payment status
GET    /api/payments/callback/*     # Payment provider callback
POST   /api/payments/webhook/*      # Payment provider webhook
```

---

## 💰 Payment Providers

### Flutterwave
- **Status**: ✅ Production-ready
- **Test Card**: 5531 8866 5725 4957
- **Currencies**: XAF, multiple African currencies
- **Fees**: ~1.4% + $0.50 per transaction
- **Settlement**: Daily
- **Docs**: https://developer.flutterwave.com

### CinetPay
- **Status**: ✅ Production-ready
- **Currencies**: XAF, multiple African currencies
- **Fees**: ~2% + variable
- **Settlement**: Daily
- **Docs**: https://doc.cinetpay.com

---

## 🗄️ Database Schema

### 10 Tables

```
users (User accounts)
├─ ID, email, password, name, phone
├─ isAdmin, createdAt, updatedAt

products (Product catalog)
├─ ID, name, slug, description, price
├─ stock, category, image, isActive

product_images (Additional product images)
├─ ID, productId, imageUrl

orders (Customer orders)
├─ ID, userId, orderNumber, total
├─ status (pending/paid/shipped), createdAt

order_items (Line items in order)
├─ ID, orderId, productSnapshot (JSON)
├─ quantity, pricePerUnit

addresses (Delivery addresses)
├─ ID, userId, street, city, region
├─ postalCode, isDefault, createdAt

payments (Payment transactions)
├─ ID, orderId, provider (flutterwave/cinetpay)
├─ amount, status, reference, createdAt

categories (Product categories)
├─ ID, name, slug, description

audit_logs (Security audit trail)
├─ ID, userId, action, details, createdAt
```

---

## 🚀 Deployment Strategies

### Option 1: Docker on VPS (Recommended)
```
Cost: ~$300/month
VPS → Docker → PostgreSQL RDS
Best for: Small-medium business
```

### Option 2: Heroku
```
Cost: ~$200/month
Git push → Automatic deployment
Best for: Quick launch, minimal ops
```

### Option 3: Kubernetes Enterprise
```
Cost: $2000+/month
Multi-region, auto-scaling
Best for: Large scale operations
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps.

---

## 📈 Performance Optimizations

✅ **Frontend**
- Next.js Image optimization (automatic WebP)
- Incremental Static Regeneration (ISR) for products
- Code splitting + lazy loading
- Gzip compression
- Client-side retry logic for unstable networks

✅ **Backend**
- Database connection pooling
- Redis caching (optional)
- Request compression
- Query optimization with Prisma
- Rate limiting to prevent abuse

✅ **Infrastructure**
- CDN caching (Cloudflare)
- Nginx reverse proxy caching
- Browser caching headers
- Image compression

---

## 📱 Mobile Optimization

✅ **Responsive Design**
- Mobile-first approach
- Touch-friendly buttons
- Readable font sizes
- Optimized images

✅ **Network Resilience**
- Automatic retry on network failure
- Offline detection
- Progressive enhancement
- Minimal JavaScript bundles (~50KB)

✅ **Performance**
- Lazy loading images
- Deferred non-critical CSS
- Minimal HTTP requests
- Optimized bundle size

---

## 🧪 Testing

### Backend
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend
```bash
npm run lint               # ESLint
npm run type-check         # TypeScript
npm run build             # Production build
```

### E2E (Optional)
```bash
npm run cy:run            # Run Cypress tests
npm run cy:open           # Open Cypress UI
```

---

## 📝 Environment Variables

### Development `.env`
```
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/patisserie
JWT_SECRET=development_secret_for_testing_only
# ... (see .env.example)
```

### Production `.env.prod`
```
NODE_ENV=production
DATABASE_URL=postgresql://user:strong_pass@db.rds.amazonaws.com:5432/patisserie
JWT_SECRET=$(openssl rand -base64 32)  # Strong random secret
FLUTTERWAVE_API_KEY=sk_live_xxxxx
CINETPAY_API_KEY=prod_key
# ... (see DEPLOYMENT.md)
```

---

## 🔄 CI/CD Pipeline

**GitHub Actions Workflow:**

```
Code push to main/develop
    ↓
Unit tests (backend + frontend)
    ↓
Build Docker image
    ↓
Push to Docker Hub
    ↓
Deploy to production
    ↓
Run smoke tests
    ↓
✅ Deployment complete (5-10 min)
```

View results: GitHub → Actions tab

---

## 📊 Monitoring & Logging

### Error Tracking (Sentry)
- Real-time error notifications
- Breadcrumb trail for debugging
- Performance monitoring
- Release tracking

### Uptime Monitoring (UptimeRobot)
- 5-minute checks
- Email/SMS alerts
- Status page

### Log Aggregation
- Centralized logging
- Searchable logs
- 30-day retention
- Alert on ERROR level

---

## 💾 Backup Strategy

✅ **Automated Daily Backups**
- Backup time: 2 AM UTC
- Backup location: AWS S3 (offsite)
- Retention: 30 days rolling window
- Restoration tested monthly

✅ **Recovery Procedure**
- RTO: 1 hour
- RPO: 24 hours
- Documented runbook
- Team trained on recovery

---

## 🆘 Troubleshooting

### Backend Issues
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs backend

# Check configuration
docker-compose -f docker-compose.prod.yml config

# Restart
docker-compose -f docker-compose.prod.yml restart backend
```

### Database Issues
```bash
# Test connection
psql -h your_db_host -U user -d patisserie

# Run migrations
npm run prisma:migrate:prod

# Reset (⚠️ destructive)
npm run prisma:reset
```

### Payment Issues
- Check Flutterwave/CinetPay dashboard
- Verify API keys in .env
- Check webhook logs in Sentry
- Review payment provider status page

See [Troubleshooting](./DEPLOYMENT.md#troubleshooting) section for more.

---

## 📞 Support

### Documentation
- [Architecture Overview](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Payment Integration](./backend/PAYMENT_INTEGRATION.md)
- [API Documentation](./API_DOCS.md) (generated from code)

### Community
- GitHub Issues: Report bugs or request features
- Email: dev@patisserie.cm
- WhatsApp: +237-XXX-XXX-XXX

### Monitoring
- **Errors**: Sentry dashboard
- **Performance**: Sentry Performance tab
- **Uptime**: UptimeRobot status page
- **Metrics**: Grafana (optional)

---

## 📋 Roadmap

### ✅ Completed
- Phase 1: Architecture design
- Phase 2: Frontend development
- Phase 3: Payment integration
- Phase 4: Production setup (CI/CD, monitoring, backups)

### ⏳ In Progress
- Phase 5: Figma-based UI refinements (awaiting designs)

### 🚀 Future Enhancements
- Phase 6: Advanced features
  - Customer reviews + ratings
  - Promotional codes + discounts
  - Email marketing integration
  - SMS notifications (Twilio)
  - Analytics dashboard (Google Analytics 4)
  - Inventory alerts
  - Multi-language support (FR, EN, Pidgin)

---

## 📄 License

MIT License - See LICENSE file

---

## 👥 Contributors

- **Architecture & Backend**: GitHub Copilot
- **Frontend & UI**: GitHub Copilot
- **Payment Integration**: GitHub Copilot
- **DevOps & Deployment**: GitHub Copilot

---

## 🎯 Next Steps

1. **Set up payment accounts**
   - Create Flutterwave account (Business)
   - Create CinetPay account (Business)
   - Get production API keys

2. **Choose hosting provider**
   - AWS RDS (PostgreSQL database)
   - DigitalOcean or Linode (VPS)
   - Or equivalent: Heroku, Railway, Render

3. **Configure CI/CD**
   - Add GitHub secrets (Docker, Vercel)
   - Test GitHub Actions pipeline
   - Set up monitoring (Sentry)

4. **Deploy to production**
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Complete pre-launch [CHECKLIST](./DEPLOYMENT_CHECKLIST.md)
   - Verify all services healthy

5. **Await Figma designs**
   - User to provide Figma mockup link
   - Refine frontend based on designs
   - Deploy frontend updates

---

**Last Updated**: February 2024
**Version**: 1.0.0
**Status**: Production Ready ✅

Start here: [Quick Start](#-quick-start) | [Deployment Guide](./DEPLOYMENT.md)
