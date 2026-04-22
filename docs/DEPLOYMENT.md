# Production Deployment Guide

## Overview

Complete guide to deploy Patisserie to production with:
- PostgreSQL managed database (AWS RDS / Heroku / DigitalOcean)
- Backend on VPS / Docker / Heroku
- Frontend on Vercel / Netlify
- Nginx reverse proxy + SSL
- Monitoring with Sentry

## Prerequisites

- Domain registered (e.g., patisserie.cm)
- SSL certificate (Let's Encrypt - free)
- VPS or Docker host (DigitalOcean, AWS, Azure, etc)
- Vercel account for frontend
- GitHub account for CI/CD

## Architecture

```
Client → CloudFlare CDN → Nginx (reverse proxy + SSL)
                ↓
           Backend API (Express)
                ↓
         PostgreSQL Database
```

---

## 1️⃣ Database Setup

### Option A: Managed Database (Recommended)

**AWS RDS**
```bash
# Create PostgreSQL 16 instance
# - Multi-AZ for redundancy
# - Automated backups (7 days)
# - Enhanced monitoring

# Connection string:
DATABASE_URL=postgresql://user:password@db.xxx.rds.amazonaws.com:5432/patisserie
```

**DigitalOcean Managed Database**
```bash
# Create PostgreSQL cluster
# - 3-node cluster for HA
# - Automatic backups

DATABASE_URL=postgresql://user:password@db-xxx-do-user-xxx.db.ondigitalocean.com:25060/patisserie?sslmode=require
```

### Option B: Self-Hosted PostgreSQL

```bash
# On VPS
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb patisserie
sudo -u postgres createuser patisserie_user
sudo -u postgres psql -c "ALTER USER patisserie_user PASSWORD 'strong_password'"
```

### Verify Connection
```bash
psql -h db.host.com -U patisserie_user -d patisserie -c "SELECT 1"
```

---

## 2️⃣ Backend Deployment

### Option A: Docker on VPS

**Setup VPS** (DigitalOcean, Linode, etc):
```bash
# SSH into VPS
ssh root@your_vps_ip

# Install Docker + Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /srv/patisserie
cd /srv/patisserie

# Clone repository
git clone https://github.com/your-org/patisserie.git .

# Create .env.prod
cat > .env.prod << EOF
DB_USER=patisserie_user
DB_PASSWORD=very_strong_password_here
DB_NAME=patisserie
DB_HOST=db.xxx.rds.amazonaws.com

JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

FLUTTERWAVE_API_KEY=sk_live_xxxxx
FLUTTERWAVE_SECRET_KEY=sk_xxxxx

CINETPAY_API_KEY=xxxxx
CINETPAY_SITE_ID=xxxxx

SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
EOF

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Option B: Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create patisserie-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0 --app patisserie-api

# Set environment variables
heroku config:set NODE_ENV=production \
  JWT_SECRET=$(openssl rand -base64 32) \
  FLUTTERWAVE_API_KEY=... \
  --app patisserie-api

# Deploy
git push heroku main

# Run migrations
heroku run npm run prisma:migrate:prod --app patisserie-api
```

### Option C: Railway / Render

Use their web interfaces for deployment (Git-based, automatic deploys)

---

## 3️⃣ Frontend Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL=https://api.patisserie.cm
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Configure build settings
# Build command: npm run build
# Publish directory: .next
```

---

## 4️⃣ SSL Certificate

### Let's Encrypt (Free)

```bash
# On VPS hosting Nginx
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d patisserie.cm -d www.patisserie.cm

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Cloudflare (Recommended)

1. Point domain NS to Cloudflare
2. Enable "Flexible SSL" or "Full SSL"
3. Automatic certificate renewal

---

## 5️⃣ Environment Variables

### Backend Production (.env.prod)

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/patisserie

# JWT
JWT_SECRET=<32+ char random string>
JWT_REFRESH_SECRET=<32+ char random string>
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Server
NODE_ENV=production
PORT=4000
API_BASE_URL=https://api.patisserie.cm
FRONTEND_URL=https://patisserie.cm
CORS_ORIGIN=https://patisserie.cm

# Payment providers
FLUTTERWAVE_API_KEY=sk_live_xxxxx
FLUTTERWAVE_SECRET_KEY=xxxxx
CINETPAY_API_KEY=xxxxx
CINETPAY_SITE_ID=xxxxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxxxxx
LOG_LEVEL=info
```

### Frontend Production (Vercel)

```
NEXT_PUBLIC_API_URL=https://api.patisserie.cm
NEXT_PUBLIC_APP_URL=https://patisserie.cm
```

---

## 6️⃣ Monitoring & Logging

### Sentry Error Tracking

```bash
# Sign up at sentry.io
# Create project for backend

# Add to backend
npm install @sentry/node

# In server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Log Management

```bash
# View Docker logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Persistent logs
# - AWS CloudWatch
# - DigitalOcean Monitoring
# - Papertrail
# - LogRocket
```

### Uptime Monitoring

- UptimeRobot (free)
- Freshworks (paid)
- Datadog (enterprise)

### Performance Monitoring

- New Relic
- Datadog
- CloudFlare Analytics

---

## 7️⃣ Database Backups

### Automated Backups

```bash
# AWS RDS: automatic (7 days retention)
# DigitalOcean: automatic (7 days)

# Manual backup
docker-compose -f docker-compose.prod.yml exec -T db pg_dump \
  -U username db_name > backup_$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
docker-compose -f docker-compose.prod.yml exec -T db psql \
  -U username db_name < backup_20240220.sql
```

---

## 8️⃣ Security Checklist

✅ **HTTPS everywhere** - SSL certificate active
✅ **Strong passwords** - DB, JWT, API keys
✅ **Firewall rules** - Only allow API port 4000 from Nginx
✅ **Environment secrets** - Never hardcode in code
✅ **Rate limiting** - Enabled on all endpoints
✅ **CORS whitelist** - Only allow frontend domain
✅ **SQL injection** - Protected via Prisma ORM
✅ **XSS protection** - Helmet headers enabled
✅ **CSRF protection** - Refresh tokens in HttpOnly cookies
✅ **API authentication** - JWT required for sensitive endpoints
✅ **Admin roles** - Only admin users access dashboard
✅ **Data encryption** - Passwords hashed with bcryptjs
✅ **Secrets rotation** - Rotate JWT secrets periodically
✅ **DDoS protection** - CloudFlare + rate limiting
✅ **Regular updates** - Keep dependencies up-to-date

---

## 9️⃣ Deployment Checklist

Before going live:

- [ ] Database setup + connection verified
- [ ] Backend built and tested
- [ ] All environment variables set
- [ ] SSL certificate installed
- [ ] Nginx proxy configured
- [ ] Frontend deployed
- [ ] DNS pointed to Nginx IP
- [ ] Sentry project created
- [ ] Payment APIs (Flutterwave/CinetPay) production keys set
- [ ] Database backup scheduled
- [ ] Email notifications configured
- [ ] Monitoring alerts enabled
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated

---

## 🔟 Post-Deployment

### Monitoring

```bash
# Check backend health every 5 minutes
curl https://api.patisserie.cm/health

# Monitor logs
docker-compose -f docker-compose.prod.yml logs -f backend | grep ERROR

# Database stats
docker-compose -f docker-compose.prod.yml exec -T db psql \
  -U username -c "SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database WHERE datname='patisserie';"
```

### Regular Maintenance

- Update Docker images (monthly)
- Rotate JWT secrets (quarterly)
- Review security logs (weekly)
- Database optimization (monthly)
- Dependency updates (as available)

### Scaling

- **Database**: Upgrade RDS instance, add read replicas
- **Backend**: Horizontal scaling with load balancer
- **Frontend**: CDN caching (Vercel/Netlify handles this)
- **API**: Add Redis cache for product catalog

---

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Verify environment variables
docker-compose -f docker-compose.prod.yml config

# Rebuild image
docker-compose -f docker-compose.prod.yml build --no-cache backend
```

### Database connection failed

```bash
# Test connection
psql -h db.host -U username -d patisserie

# Check firewall
sudo ufw status

# Verify DATABASE_URL format
echo $DATABASE_URL
```

### HTTPS certificate expired

```bash
# Let's Encrypt renewal
sudo certbot renew

# Cloudflare: automatic
```

---

## Support

- Backend issues → Check Sentry
- Database issues → Check managed service dashboard
- Frontend issues → Check Vercel logs
- Payment issues → Check Flutterwave/CinetPay dashboards
- General → Check application logs

**Deployment URL**: https://api.patisserie.cm
**Frontend URL**: https://patisserie.cm
