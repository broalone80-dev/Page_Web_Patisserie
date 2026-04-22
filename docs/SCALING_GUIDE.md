# Production Scaling Guide

## Current Architecture

```
Frontend (Vercel)
    ↓
CDN (Cloudflare)
    ↓
Nginx Reverse Proxy (Single VPS)
    ↓
Backend (Express - Single instance)
    ↓
PostgreSQL (Single RDS instance)
```

## Single Server Capacity

**Current:** ~500 concurrent users, 1000 req/sec

**Bottlenecks:**
- Backend CPU (single-core)
- Database connections (max 100)
- Network bandwidth

---

## Phase 1: Budget Scaling (0-1000 users/month)

### 1. Increase Server Resources
```bash
# Upgrade VPS specs
# 1 vCPU → 2 vCPU
# 2 GB RAM → 4 GB RAM
# Cost increase: ~$5-10/month
```

### 2. Enable Caching
```bash
# Add Redis for sessions + product cache
docker run -d -p 6379:6379 redis:alpine

# Environment variable:
REDIS_URL=redis://redis:6379/0
```

### 3. Database Read Replica
```bash
# AWS RDS: Create read replica (same region)
# Cost increase: ~$30/month
# Queries > 1000 req/min go to replica
```

### 4. CDN Optimization
```bash
# Cloudflare: Enable
# - Page Rules (cache product listings)
# - Image optimization
# - Network optimization
```

---

## Phase 2: Horizontal Scaling (1000-10k users/month)

### 1. Load Balancer
```yaml
Client
  ↓
Load Balancer (AWS ALB / Nginx)
  ↓
Backend Pod 1 (Express)
Backend Pod 2 (Express)
Backend Pod 3 (Express)
  ↓
Database (RDS - Multi-AZ)
```

**Setup:**
```bash
# AWS ALB
# - 3 backend instances
# - Auto-scaling group (min: 2, max: 6)
# - Health checks every 30s
```

### 2. Container Orchestration
```bash
# Kubernetes or Docker Swarm
docker swarm init

# Deploy service
docker service create \
  --name patisserie-api \
  --publish 4000:4000 \
  --replicas 3 \
  patisserie-backend:latest
```

### 3. Database Scaling
```sql
-- Set up connection pooling
-- PgBouncer on separate server
-- Max connections: 300

-- Read replicas: 2x (different regions)
-- Write to primary, read from replicas
```

### 4. Session Management
```bash
# Redis cluster (3+ nodes)
# Sessions: Redis
# Product cache: Redis
# Shopping carts: Redis

# Cost: ~$50/month for managed Redis
```

---

## Phase 3: Enterprise Scaling (10k+ users/month)

### 1. Multi-Region Deployment
```
US Region (Primary)
├─ 5x Backend instances
├─ RDS Primary
├─ Redis cluster
└─ Nginx (primary)

EU Region (Secondary)
├─ 5x Backend instances
├─ RDS Read replica
├─ Redis cluster
└─ Nginx (failover)

Africa Region (Tertiary)
├─ 3x Backend instances
├─ RDS Read replica
└─ Nginx
```

### 2. Database Architecture
```
RDS Primary (Write)
├─ US Region
├─ Multi-AZ
└─ Automated backups

Read Replica 1 (US)
Read Replica 2 (EU)
Read Replica 3 (Africa)

Connection routing:
- Write queries → Primary
- Read queries → Nearest replica
```

### 3. API Gateway + Microservices
```
API Gateway (Kong/AWS API Gateway)
├─ Auth Service (JWT validation)
├─ Product Service (catalog)
├─ Order Service (transactions)
├─ Payment Service (Flutterwave/CinetPay)
└─ Admin Service (dashboard)
```

### 4. Message Queue
```
RabbitMQ / AWS SQS
├─ Order processing queue
├─ Payment verification queue
├─ Email notification queue
└─ Log aggregation queue
```

---

## Performance Monitoring

### Key Metrics

```bash
# Frontend (Vercel Analytics)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

# Backend (Sentry + custom)
- API response time (P50, P95, P99)
- Error rate (target: < 0.1%)
- Request throughput (req/sec)
- Database query time
- Cache hit rate

# Infrastructure
- CPU utilization (target: < 70%)
- Memory usage (target: < 80%)
- Disk I/O
- Network bandwidth
```

### Grafana Dashboard

```bash
# Install Grafana + Prometheus
docker run -d -p 3000:3000 grafana/grafana

# Metrics to monitor:
- Backend response times
- Database connection pool
- Redis memory usage
- Error rates by endpoint
- Payment success rate
```

---

## Scaling Decision Tree

```
Starting out?
├─ Yes → Single VPS + RDS (Phase 1)
└─ No → Upgrade VPS resources first

Users growing > 5k/month?
├─ Yes → Load balancer + 3x backend (Phase 2)
└─ No → Stay on Phase 1

Database slow?
├─ Yes → Add read replica + redis cache
└─ No → Continue monitoring

Global expansion?
├─ Yes → Multi-region deployment (Phase 3)
└─ No → Single region suffices
```

---

## Cost Estimation

### Phase 1 Budget Setup
```
VPS (2 vCPU, 4GB RAM):    $20/month
PostgreSQL RDS:            $50/month
Redis (managed):           $20/month
Cloudflare CDN:            $200/month
Sentry monitoring:         $29/month
UptimeRobot:              Free
────────────────────────────────
Total:                     ~$319/month
```

### Phase 2 Horizontal Scaling
```
Load Balancer (AWS ALB):   $16/month
3x Backend (EC2):          $90/month
RDS Multi-AZ + Replicas:   $200/month
Redis Cluster:             $50/month
────────────────────────────────
Additional cost:           ~$356/month
Total:                     ~$675/month
```

### Phase 3 Enterprise
```
Multi-region infrastructure: $2000+/month
Kubernetes management:       $500+/month
Enterprise monitoring:       $500+/month
────────────────────────────────
Total:                       $3000+/month
```

---

## Migration Steps (Phase 1 → Phase 2)

### Week 1: Preparation
- [ ] Plan load balancer setup
- [ ] Create new database replica
- [ ] Set up staging environment

### Week 2: Testing
- [ ] Load test with 10k concurrent users
- [ ] Fail-over testing
- [ ] Data replication verification

### Week 3: Deployment
- [ ] Deploy load balancer
- [ ] Migrate traffic (10% → 50% → 100%)
- [ ] Monitor for issues

### Week 4: Optimization
- [ ] Tune auto-scaling policies
- [ ] Optimize database indexes
- [ ] Fine-tune cache TTLs

---

## Recommended Providers

### Hosting
- **AWS EC2** - Flexible, pay-as-you-go
- **DigitalOcean** - Simple, affordable
- **Linode** - Dedicated resources
- **Azure** - Enterprise features

### Database
- **AWS RDS** - Managed, scalable
- **DigitalOcean Managed** - Simple, cheap
- **Azure Database** - Enterprise

### Cache
- **Redis Cloud** - Managed Redis
- **AWS ElastiCache** - Integrated with AWS
- **Memcached** - Lightweight alternative

### Load Balancing
- **AWS ALB** - Production-grade
- **Nginx** - Self-hosted
- **HAProxy** - Open-source

### Configuration Management
- **Terraform** - Infrastructure as Code
- **Docker Compose** - Simple orchestration
- **Kubernetes** - Enterprise containers

---

## Monitoring & Alerts

```yaml
# Alert when:
Response Time > 1s        # Backend slow
Error Rate > 1%           # Service unhealthy
CPU Usage > 80%           # Scale up
Memory Usage > 85%        # Increase capacity
Database Connections > 80 # Connection pool full
Disk Usage > 90%          # Clean up logs
```

---

## Disaster Recovery

### RTO (Recovery Time Objective): 1 hour
### RPO (Recovery Point Objective): 15 minutes

**Recovery steps:**
1. Automated failover to read replica (2 min)
2. Promote read replica to primary (5 min)
3. Spin up new instances (10 min)
4. Data verification (5 min)

**Total: ~22 minutes (within SLA)**

---

## Auto-Scaling Configuration

```yaml
# Kubernetes HPA example
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: patisserie-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: patisserie-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## Next Steps

1. **Monitor Phase 1** - Run for 3-6 months
2. **Analyze metrics** - Identify bottlenecks
3. **Plan Phase 2** - When needed, not before
4. **Execute gradually** - No big-bang migrations
5. **Test thoroughly** - Fail-over scenarios
6. **Optimize costs** - Use reserved instances
7. **Document everything** - For future engineers

---

**Remember**: Premature optimization is the root of all evil. Scale only when needed!
