# CI/CD & Production Setup Guide

## Overview

Complete guide to:
1. **Automated CI/CD** - GitHub Actions (test → build → deploy)
2. **Error Monitoring** - Sentry with performance tracking
3. **Database Backups** - Automated + offsite storage
4. **Environment Management** - Secrets, configs, scaling

---

## GitHub Actions CI/CD Pipeline

### Features

✅ **Automated Testing**
- Backend: Unit tests + integration tests
- Frontend: ESLint + TypeScript type checking + Next.js build
- Database: Runs on PostgreSQL service container

✅ **Build & Push**
- Backend: Docker image → Docker Hub
- Frontend: Next.js build → Vercel deployment

✅ **Deployment**
- Automatic deployment on `main` branch push
- Backend to Docker registry
- Frontend to Vercel CDN

### Secrets Setup

Add to GitHub repository settings (`Settings → Secrets`):

```bash
# Docker credentials
DOCKER_USERNAME=your_docker_username
DOCKER_PASSWORD=your_docker_password

# Vercel deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### Running Pipeline

```bash
# Pipeline triggers on:
1. Push to main branch
2. Push to develop branch  
3. Pull requests to main

# View results:
# GitHub → Actions tab → Click workflow
```

### Deployment Flow

```
Developer pushes code
        ↓
GitHub Actions triggers
        ↓
Build backend image
        ↓
Run backend tests (PostgreSQL)
        ↓
Run frontend tests (lint + type-check)
        ↓
Push backend image to Docker Hub
        ↓
Deploy frontend to Vercel
        ↓
✅ Deployment complete (5-10 min)
```

---

## Sentry Error Monitoring

### Setup

1. **Create Project**
   ```
   Visit: https://sentry.io
   Sign up → New Project
   Select "Node.js" platform
   ```

2. **Get DSN**
   ```
   Copy your DSN from project settings
   Format: https://xxxxx@sentry.io/xxxxx
   ```

3. **Add to .env.prod**
   ```bash
   SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   ```

4. **Install Dependencies** (already in package.json)
   ```bash
   npm install @sentry/node
   ```

5. **Initialize in Server**
   ```typescript
   // In server.ts
   import { initSentry } from '@config/sentry';
   
   const app = express();
   initSentry(app);  // Must be before route handlers
   ```

### What Gets Tracked

**Errors:**
- Uncaught exceptions
- API errors (500+)
- Payment failures
- Database connection errors

**Performance:**
- API response times
- Database query times
- External API calls (Flutterwave, CinetPay)

**Custom Events:**
- Payment processing
- Order creation
- User registration
- Admin actions

### Dashboard

```
Sentry dashboard shows:
├─ Error count (trending)
├─ Affected users
├─ Environment details
├─ Stack trace
├─ Browser/OS info
├─ Breadcrumbs (last 100 events)
└─ Performance metrics
```

### Alerts

Configure email alerts for:
- Error rate spike (> 10% from baseline)
- New error type
- Recurring errors (> 10 in 1 hour)
- Performance degradation (> 1s response time)

---

## Database Backup Strategy

### Automated Backups

#### Setup Cron Job

```bash
# SSH into VPS
ssh root@your_vps_ip

# Make backup script executable
chmod +x /srv/patisserie/backup.sh

# Add to crontab (run daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /srv/patisserie/backup.sh >> /var/log/patisserie-backup.log 2>&1
```

#### Backup Script Features

```bash
#!/bin/bash
# Daily at 2 AM:
1. Dump PostgreSQL database (compressed)
2. Upload to AWS S3
3. Clean old backups (keep 30 days)
4. Send completion email
5. Log results
```

#### Restore from Backup

```bash
# List available backups
ls -lh /backups/patisserie/

# Restore from specific backup
docker-compose -f docker-compose.prod.yml exec -T db \
  pg_restore -U patisserie_user -d patisserie backup_20240220.sql

# Verify restored data
docker-compose -f docker-compose.prod.yml exec -T db psql \
  -U patisserie_user -c "SELECT COUNT(*) FROM orders;"
```

### AWS S3 Backup Storage

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credentials
aws configure
# Enter:
# AWS Access Key ID: (from IAM)
# AWS Secret Access Key: (from IAM)
# Region: us-west-2

# Create S3 bucket for backups
aws s3 mb s3://patisserie-backups

# Upload backup
aws s3 cp backup_20240220.sql.gz s3://patisserie-backups/

# List backups
aws s3 ls s3://patisserie-backups/

# Download backup
aws s3 cp s3://patisserie-backups/backup_20240220.sql.gz ./
```

### Backup Verification

```bash
# Monthly: Test restoration
# 1. Download backup from S3
# 2. Restore to staging environment
# 3. Run data integrity checks
#    - Count records
#    - Verify relationships
#    - Check constraints

# Command to verify:
docker-compose -f docker-compose.prod.yml exec -T db psql \
  -U patisserie_user -d patisserie << EOF
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION
SELECT 'products', COUNT(*) FROM products
UNION
SELECT 'orders', COUNT(*) FROM orders
UNION
SELECT 'payments', COUNT(*) FROM payments;
EOF
```

### Backup Storage Costs

```
AWS S3 Standard:
- Storage: $0.023 per GB/month
- 30 backups × 500 MB = 15 GB
- Cost: ~$0.35/month

Daily backup rotation:
├─ Keep 30-day rolling window
├─ Weekly snapshots archived
└─ Yearly archive (long-term retention)
```

---

## Environment Variable Management

### Local Development (.env)

```bash
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/patisserie

JWT_SECRET=dev_secret_1234567890
JWT_REFRESH_SECRET=dev_refresh_1234567890

FLUTTERWAVE_API_KEY=sk_test_xxxxx
FLUTTERWAVE_SECRET_KEY=sk_test_xxxxx
CINETPAY_API_KEY=test_api_key
CINETPAY_SITE_ID=test_site

API_BASE_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

SENTRY_DSN=
LOG_LEVEL=debug
```

### Production (.env.prod)

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:strong_pass@db.rds.amazonaws.com:5432/patisserie

JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

FLUTTERWAVE_API_KEY=sk_live_xxxxx
FLUTTERWAVE_SECRET_KEY=sk_live_xxxxx
CINETPAY_API_KEY=prod_api_key
CINETPAY_SITE_ID=prod_site

API_BASE_URL=https://api.patisserie.cm
FRONTEND_URL=https://patisserie.cm
CORS_ORIGIN=https://patisserie.cm

SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
LOG_LEVEL=info
```

### Staging (.env.staging)

Clone of production but with test payment credentials.

### Secret Rotation

**Every 3 months:**
1. Generate new JWT secrets
2. Update in environment
3. Redeploy backend
4. Monitor for session issues
5. Keep old secrets for grace period

---

## Monitoring & Health Checks

### Health Check Endpoint

```bash
# Backend health endpoint
curl https://api.patisserie.cm/health

# Response (200 OK):
{
  "status": "healthy",
  "timestamp": "2024-02-20T15:30:00Z",
  "uptime": 86400,
  "version": "1.0.0"
}
```

### UptimeRobot Configuration

1. Create monitor:
   - **URL**: https://api.patisserie.cm/health
   - **Interval**: 5 minutes
   - **Type**: HTTP(s)

2. Add alerts:
   - Email to: admin@patisserie.cm
   - SMS to: +237-XXX-XXX-XXX
   - Slack webhook (optional)

3. Thresholds:
   - Trigger alert on: 2 consecutive failures
   - Timeout: 30 seconds

### Infrastructure Metrics

```bash
# Via Sentry dashboard:
- API response times (P50, P95, P99)
- Error rates by endpoint
- Database connection pool
- Memory usage

# Via server:
docker stats --no-stream

# Docker status
docker-compose -f docker-compose.prod.yml ps
```

---

## Disaster Recovery Process

### Recovery Time Objective (RTO): 1 hour

### Recovery Point Objective (RPO): 24 hours

### Step-by-step Recovery

```bash
# 1. Identify the issue (5 min)
# - Check Sentry errors
# - Check server logs
# - Check database status

# 2. Backup current state (5 min)
docker-compose -f docker-compose.prod.yml exec -T db pg_dump \
  -U patisserie_user patisserie > rollback.sql

# 3. Restore from backup (10 min)
docker-compose -f docker-compose.prod.yml exec -T db psql \
  -U patisserie_user patisserie < /backups/patisserie/backup_20240219.sql

# 4. Rollback code (5 min)
git checkout previous-stable-commit
docker-compose -f docker-compose.prod.yml up -d backend

# 5. Verify services (10 min)
curl https://api.patisserie.cm/health
docker-compose -f docker-compose.prod.yml logs backend

# 6. Monitor (30 min)
# - Check error rates
# - Verify user reports
# - Monitor performance

# Total: ~65 minutes (within SLA)
```

---

## Production Checklist

Before each deployment:

- [ ] All tests passing
- [ ] Code review completed
- [ ] Database migrations tested
- [ ] Backup taken
- [ ] Environment variables verified
- [ ] Sentry project healthy
- [ ] Payment credentials correct
- [ ] SSL certificate valid (expires in > 30 days)
- [ ] No breaking changes to API
- [ ] Documentation updated
- [ ] Team notified

---

## Support & Troubleshooting

### Common Issues

**Backend won't start**
```bash
docker-compose -f docker-compose.prod.yml logs backend
# Check DATABASE_URL, JWT_SECRET, payment keys
```

**Database slow**
```bash
# Check connections
docker-compose -f docker-compose.prod.yml exec -T db psql \
  -U patisserie_user -c "SELECT count(*) FROM pg_stat_activity;"

# Optimize indexes
docker-compose -f docker-compose.prod.yml exec -T db reindexdb
```

**Payment failures**
- Check Flutterwave/CinetPay dashboard for API issues
- Verify API keys in environment
- Check Sentry for failed webhook signatures

**High error rate**
- Check server resources (CPU, memory, disk)
- Review Sentry dashboard for patterns
- Check database connection pool status

---

**Next Phase**: Await Figma designs from user for Phase 5 frontend refinements.
