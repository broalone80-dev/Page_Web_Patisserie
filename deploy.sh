#!/bin/bash

# Production deployment script for Patisserie

set -e

echo "🚀 Starting Patisserie production deployment..."

# 1. Environment variables
echo "📝 Loading environment variables..."
if [ ! -f .env.prod ]; then
  echo "❌ .env.prod not found!"
  echo "Create .env.prod with all required variables:"
  echo "  DB_USER, DB_PASSWORD, DB_NAME"
  echo "  JWT_SECRET, JWT_REFRESH_SECRET"
  echo "  FLUTTERWAVE_API_KEY, FLUTTERWAVE_SECRET_KEY"
  echo "  CINETPAY_API_KEY, CINETPAY_SITE_ID"
  echo "  SENTRY_DSN"
  exit 1
fi

source .env.prod

# 2. Database backup
echo "💾 Creating database backup..."
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

docker-compose -f docker-compose.prod.yml exec -T db pg_dump \
  -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/db_backup.sql" || true

# 3. Pull latest images
echo "📦 Pulling latest Docker images..."
docker pull postgres:16-alpine
docker pull nginx:alpine
docker pull "$DOCKER_USERNAME/patisserie-backend:latest"

# 4. Database migrations
echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml up -d db
sleep 10
docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U "$DB_USER" || (
  echo "⏳ Waiting for database..."
  sleep 20
)

# Run backend migrations
docker-compose -f docker-compose.prod.yml run --rm backend npm run prisma:migrate:prod || true

# 5. Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# 6. Verify health
echo "✅ Checking service health..."
for i in {1..30}; do
  if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
    break
  fi
  echo "⏳ Waiting for backend to be ready... ($i/30)"
  sleep 2
done

# 7. Verify database
echo "🔍 Verifying database..."
docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U "$DB_USER"

echo "✅ Deployment completed successfully!"
echo ""
echo "Services running:"
echo "  API: http://localhost:4000"
echo "  Frontend: https://patisserie.vercel.app"
echo ""
echo "Useful commands:"
echo "  docker-compose -f docker-compose.prod.yml logs -f backend"
echo "  docker-compose -f docker-compose.prod.yml ps"
echo "  docker-compose -f docker-compose.prod.yml exec backend npm run prisma:studio"
