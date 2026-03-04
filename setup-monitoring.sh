#!/bin/bash

# Monitoring setup script for Patisserie
# Sets up Sentry, log aggregation, and uptime monitoring

echo "🔍 Setting up monitoring for Patisserie..."

# 1. Create Sentry project
echo "📊 Creating Sentry project..."
echo "Visit: https://sentry.io/projects/"
echo "Create new project → Select 'Node.js' platform"
echo "Copy DSN and set SENTRY_DSN environment variable"

# 2. Setup log aggregation (optional)
echo ""
echo "📝 Setting up log aggregation..."
echo "Options:"
echo "  - Papertrail: https://www.papertrail.com/"
echo "  - Datadog: https://www.datadoghq.com/"
echo "  - CloudWatch: https://aws.amazon.com/cloudwatch/"

# 3. Setup uptime monitoring
echo ""
echo "⏱️  Setting up uptime monitoring..."
echo "Create UptimeRobot monitor:"
echo "  URL: https://api.patisserie.cm/health"
echo "  Interval: 5 minutes"
echo "  Alert via email: admin@patisserie.cm"

# 4. Database monitoring alerts
echo ""
echo "💾 Database monitoring alerts..."
echo "Setup in your database provider:"
echo "  - AWS RDS: Enable Enhanced Monitoring"
echo "  - DigitalOcean: Enable Monitoring"
echo "  - Self-hosted: Install pgAdmin / pgMonitor"

# 5. Application metrics
echo ""
echo "📈 Application metrics dashboard..."
echo "Visit Sentry: https://sentry.io/organizations/"
echo "Dashboard → Performance"
echo "Monitor:"
echo "  - API response times"
echo "  - Error rates"
echo "  - Transaction volumes"

echo ""
echo "✅ Monitoring setup complete!"
echo ""
echo "Next steps:"
echo "1. Set SENTRY_DSN in .env.prod"
echo "2. Update deploy.sh with monitoring credentials"
echo "3. Test error tracking: trigger intentional error"
echo "4. Verify dashboard updates within 5 minutes"
