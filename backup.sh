#!/bin/bash

# Automated backup script for PostgreSQL
# Run via cron: 0 2 * * * /opt/patisserie/backup.sh

set -e

BACKUP_DIR="/backups/patisserie"
DB_HOST="${DB_HOST:-db}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-patisserie}"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz"

echo "[$(date)] Starting backup of $DB_NAME..."

# Create backup
if PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -Fc \
  -Z 9 \
  -v \
  > "$BACKUP_FILE"; then
  
  echo "[$(date)] ✅ Backup completed: $BACKUP_FILE"
  echo "[$(date)] Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
  
  # Upload to S3 (optional)
  if command -v aws &> /dev/null; then
    echo "[$(date)] Uploading to S3..."
    aws s3 cp "$BACKUP_FILE" "s3://patisserie-backups/$(basename "$BACKUP_FILE")"
    echo "[$(date)] ✅ S3 upload completed"
  fi
  
  # Delete old backups (keep only last 30 days)
  echo "[$(date)] Cleaning up old backups..."
  find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
  echo "[$(date)] ✅ Cleanup completed"
  
else
  echo "[$(date)] ❌ Backup failed!"
  # Send alert email
  echo "Backup failed for $DB_NAME" | mail -s "Patisserie Backup Alert" admin@patisserie.cm
  exit 1
fi

echo "[$(date)] Backup process finished"
