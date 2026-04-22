# Production Environment Checklist

## Pre-Deployment

### 1. Security Audit
- [ ] JWT secrets are strong (32+ random characters)
- [ ] Database password meets complexity requirements
- [ ] API keys stored securely (not in git)
- [ ] CORS whitelist includes only trusted domains
- [ ] Rate limiting configured on sensitive endpoints
- [ ] SQL injection protection verified (Prisma ORM)
- [ ] XSS protection enabled (Helmet headers)
- [ ] CSRF token validation enabled
- [ ] No hardcoded credentials in code
- [ ] Git history cleaned (no exposed secrets)

### 2. Database
- [ ] PostgreSQL 16+ installed
- [ ] Connection string verified
- [ ] Database user created with limited privileges
- [ ] Backup strategy implemented
- [ ] Backup retention policy: 30 days
- [ ] Point-in-time recovery tested
- [ ] Automatic backups scheduled (daily at 2 AM)
- [ ] Connection pooling configured
- [ ] SSL required for DB connections
- [ ] Query optimization performed

### 3. Backend
- [ ] Dependencies audited (`npm audit`)
- [ ] Build tested locally (`npm run build`)
- [ ] All environment variables set
- [ ] Health check endpoint working
- [ ] Prism ORM migrations executed
- [ ] Error handling comprehensive
- [ ] Logging configured (bunyan/winston)
- [ ] Sentry DSN configured
- [ ] Performance logging enabled
- [ ] TypeScript strict mode enabled

### 4. Frontend
- [ ] Next.js build optimized (`npm run build`)
- [ ] Environment variables set
- [ ] API endpoints production-ready
- [ ] Image optimization enabled
- [ ] CSS/JS minified
- [ ] SEO metadata complete
- [ ] Accessibility audit passed (a11y)
- [ ] Mobile responsiveness tested
- [ ] Browser compatibility tested (Chrome, Firefox, Safari)

### 5. Infrastructure
- [ ] VPS/server provisioned
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] SSL certificate acquired (Let's Encrypt)
- [ ] Nginx installed and configured
- [ ] Firewall rules configured
  - [ ] Port 80 open (HTTP)
  - [ ] Port 443 open (HTTPS)
  - [ ] Port 5432 closed (DB internal only)
- [ ] Reverse proxy configured
- [ ] Load balancer setup (if scaling)
- [ ] CDN configured (Cloudflare recommended)

### 6. Payments
- [ ] Flutterwave production credentials obtained
- [ ] CinetPay production credentials obtained
- [ ] Payment callbacks configured for production URLs
- [ ] Webhook IP whitelist updated
- [ ] Signature verification tested
- [ ] Payment amounts verified (cents-based)
- [ ] Tax calculation verified
- [ ] Delivery fees verified

### 7. Monitoring
- [ ] Sentry project created
- [ ] Error tracking verified
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured (UptimeRobot)
- [ ] Alert emails configured
- [ ] Log aggregation setup
- [ ] Database monitoring enabled
- [ ] CPU/Memory alerts configured
- [ ] Disk space alerts configured

### 8. Testing
- [ ] Unit tests passing (backend)
- [ ] Integration tests passing
- [ ] API endpoint testing complete
- [ ] Authentication flow tested
- [ ] Authorization tested (admin vs user)
- [ ] Payment flow tested (sandbox)
- [ ] Error scenarios tested
- [ ] Load testing completed (100 concurrent users)
- [ ] Security penetration testing (optional)

### 9. Documentation
- [ ] README updated with production URLs
- [ ] Deployment guide complete
- [ ] Emergency procedures documented
- [ ] Rollback procedure documented
- [ ] API documentation generated
- [ ] Known issues documented
- [ ] Troubleshooting guide created

### 10. Backup & Disaster Recovery
- [ ] Database backups automated
- [ ] Backup restoration tested (monthly)
- [ ] Backup storage offsite (S3/Cloud)
- [ ] Disaster recovery plan documented
- [ ] RTO (Recovery Time Objective): 1 hour
- [ ] RPO (Recovery Point Objective): 24 hours
- [ ] Incident response plan created

## Deployment Commands

```bash
# Clone repository
git clone https://github.com/your-org/patisserie.git /srv/patisserie
cd /srv/patisserie

# Create environment file
cp .env.example .env.prod
nano .env.prod  # Edit with production values

# Deploy
chmod +x deploy.sh
./deploy.sh

# Verify
curl https://api.patisserie.cm/health
curl https://patisserie.cm
```

## Post-Deployment

### 1. Verify Services
- [ ] Backend API responding
- [ ] Frontend loading
- [ ] Database connected
- [ ] Sentry receiving events
- [ ] Uptime monitoring active

### 2. Monitor First 24 Hours
- [ ] Error rates normal
- [ ] Response times acceptable (< 500ms)
- [ ] No missing configuration
- [ ] Payment processing working
- [ ] User registration working
- [ ] Admin dashboard functional

### 3. User Communication
- [ ] Status page updated
- [ ] Customer email sent
- [ ] Social media announcement
- [ ] Blog post/news published
- [ ] Support team notified

### 4. Ongoing Maintenance
- [ ] Daily log review
- [ ] Weekly security updates
- [ ] Monthly backup testing
- [ ] Quarterly disaster recovery drill
- [ ] Semi-annual security audit

## Troubleshooting

### Backend won't start
```bash
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml config
```

### Database connection failed
```bash
# Test local connection
psql -h db.host.com -U patisserie_user -d patisserie

# Check firewall
sudo ufw status
sudo ufw allow 5432
```

### SSL certificate error
```bash
# Renew Let's Encrypt
sudo certbot renew

# Check certificate
openssl x509 -in /etc/letsencrypt/live/patisserie.cm/cert.pem -text -noout
```

### High error rate
1. Check Sentry dashboard
2. Review Docker logs
3. Check database connectivity
4. Monitor server resources (CPU, memory, disk)
5. Check payment provider status pages

## Rollback Procedure

If deployment fails:

```bash
# Backup current database
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U patisserie_user patisserie > rollback_backup.sql

# Restore previous version
git checkout previous-stable-version
./deploy.sh

# Verify
curl https://api.patisserie.cm/health
```

## Contact Information

- Backend Admin: backend-admin@patisserie.cm
- Database Admin: dba@patisserie.cm
- Security Issues: security@patisserie.cm
- 24/7 Support: +237-XXX-XXX-XXX

---

**Last Updated**: 2024-02-20
**Environment**: Production
**Status**: Ready for Deployment
