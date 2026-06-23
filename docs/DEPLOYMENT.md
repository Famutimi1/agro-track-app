# AgroTrack Deployment Guide

This guide covers deploying AgroTrack to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Requirements](#infrastructure-requirements)
3. [Environment Configuration](#environment-configuration)
4. [Docker Deployment](#docker-deployment)
5. [Manual Deployment](#manual-deployment)
6. [Database Setup](#database-setup)
7. [SSL/TLS Configuration](#ssltls-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup Strategy](#backup-strategy)
10. [Scaling](#scaling)

---

## Prerequisites

### Software Requirements

- Docker 20+ and Docker Compose 2+ (for containerized deployment)
- Node.js 18+ (for manual deployment)
- PostgreSQL 14+
- Redis 6+
- Nginx (reverse proxy)
- Certbot (SSL certificates)

### Cloud Services

- AWS S3 (document storage)
- Paystack account (payments)
- SendGrid account (emails)
- Termii account (SMS)

---

## Infrastructure Requirements

### Minimum Production Setup

| Component | Specification |
|-----------|---------------|
| API Server | 2 vCPU, 4GB RAM |
| Database | 2 vCPU, 8GB RAM, 100GB SSD |
| Redis | 1 vCPU, 2GB RAM |
| Frontend | 1 vCPU, 2GB RAM |

### Recommended Production Setup

| Component | Specification |
|-----------|---------------|
| API Server (x2) | 4 vCPU, 8GB RAM each |
| Database (Primary) | 4 vCPU, 16GB RAM, 500GB SSD |
| Database (Replica) | 4 vCPU, 16GB RAM, 500GB SSD |
| Redis Cluster | 2 vCPU, 4GB RAM (x3 nodes) |
| Frontend CDN | CloudFlare or AWS CloudFront |
| Load Balancer | AWS ALB or Nginx |

---

## Environment Configuration

### Backend Production Environment

Create `/opt/agrotrack/backend/.env`:

```env
# Server
PORT=3001
NODE_ENV=production

# Database (use connection pooling)
DATABASE_URL="postgresql://agrotrack:STRONG_PASSWORD@db.internal:5432/agrotrack_prod?connection_limit=20"

# Redis
REDIS_URL="redis://:REDIS_PASSWORD@redis.internal:6379"

# JWT (use strong, unique secrets)
JWT_SECRET="GENERATE_WITH: openssl rand -base64 48"
JWT_REFRESH_SECRET="GENERATE_WITH: openssl rand -base64 48"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# AWS S3
AWS_ACCESS_KEY_ID="REPLACE_WITH_SECRET"
AWS_SECRET_ACCESS_KEY="REPLACE_WITH_SECRET"
AWS_REGION="eu-west-1"
AWS_S3_BUCKET="agrotrack-prod-uploads"

# Paystack (Live keys)
PAYSTACK_SECRET_KEY="REPLACE_WITH_SECRET"
PAYSTACK_PUBLIC_KEY="pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# SMS - Termii
TERMII_API_KEY="your-termii-api-key"
TERMII_SENDER_ID="AgroTrack"

# Email - SendGrid
SENDGRID_API_KEY="REPLACE_WITH_SECRET"
SENDGRID_FROM_EMAIL="noreply@agrotrack.ng"
SENDGRID_FROM_NAME="AgroTrack"

# Security
CORS_ORIGIN="https://agrotrack.ng,https://www.agrotrack.ng"
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="info"
```

### Frontend Production Environment

Create `/opt/agrotrack/frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://api.agrotrack.ng/api
NEXT_PUBLIC_WS_URL=https://api.agrotrack.ng
NEXT_PUBLIC_APP_URL=https://agrotrack.ng
```

---

## Docker Deployment

### 1. Create Docker Compose File

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:14-alpine
    restart: always
    environment:
      POSTGRES_DB: agrotrack_prod
      POSTGRES_USER: agrotrack
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agrotrack -d agrotrack_prod"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:6-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data
    networks:
      - internal
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    env_file:
      - ./backend/.env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - internal
      - web
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: always
    env_file:
      - ./frontend/.env.production
    networks:
      - web
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/certbot:/var/www/certbot:ro
    depends_on:
      - api
      - frontend
    networks:
      - web

networks:
  internal:
    driver: bridge
  web:
    driver: bridge

volumes:
  pgdata:
  redisdata:
```

### 2. Backend Dockerfile

Create `backend/Dockerfile.prod`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

USER expressjs

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### 3. Frontend Dockerfile

Create `frontend/Dockerfile.prod`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

### 4. Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3001;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    # API Server
    server {
        listen 443 ssl http2;
        server_name api.agrotrack.ng;

        ssl_certificate /etc/nginx/ssl/api.agrotrack.ng/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/api.agrotrack.ng/privkey.pem;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        location / {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # WebSocket
        location /socket.io {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }

    # Frontend Server
    server {
        listen 443 ssl http2;
        server_name agrotrack.ng www.agrotrack.ng;

        ssl_certificate /etc/nginx/ssl/agrotrack.ng/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/agrotrack.ng/privkey.pem;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name agrotrack.ng www.agrotrack.ng api.agrotrack.ng;
        return 301 https://$server_name$request_uri;
    }
}
```

### 5. Deploy

```bash
# Set environment variables
export DB_PASSWORD="your-strong-db-password"
export REDIS_PASSWORD="your-strong-redis-password"

# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose exec api npx prisma migrate deploy

# Check logs
docker-compose logs -f api
```

---

## Database Setup

### Initial Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE agrotrack_prod;
CREATE USER agrotrack WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE agrotrack_prod TO agrotrack;

# Enable required extensions
\c agrotrack_prod
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- For geospatial features
```

### Run Migrations

```bash
cd backend
npx prisma migrate deploy
```

### Database Backup

Create automated backup script `scripts/backup-db.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/agrotrack/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="agrotrack_${TIMESTAMP}.sql.gz"

# Create backup
docker-compose exec -T db pg_dump -U agrotrack agrotrack_prod | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" s3://agrotrack-backups/daily/

# Keep only last 7 days locally
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}"
```

Add to crontab:
```bash
0 2 * * * /opt/agrotrack/scripts/backup-db.sh >> /var/log/agrotrack-backup.log 2>&1
```

---

## SSL/TLS Configuration

### Using Let's Encrypt

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Obtain certificates
certbot certonly --webroot -w /var/www/certbot \
  -d agrotrack.ng -d www.agrotrack.ng -d api.agrotrack.ng

# Auto-renewal (add to crontab)
0 0 1 * * certbot renew --quiet && docker-compose exec nginx nginx -s reload
```

---

## Monitoring & Logging

### Health Check Endpoint

The API exposes `/health` for monitoring:

```json
{
  "status": "healthy",
  "timestamp": "2025-06-22T10:30:00Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Logging with PM2 (Manual Deployment)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/index.js --name agrotrack-api

# Enable log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 7
```

### Monitoring Dashboard

Consider using:
- **Grafana + Prometheus** for metrics
- **ELK Stack** for log aggregation
- **Sentry** for error tracking
- **Uptime Robot** for availability monitoring

---

## Scaling

### Horizontal Scaling

1. **API Servers**: Run multiple instances behind a load balancer
2. **Database**: Set up read replicas for query distribution
3. **Redis**: Use Redis Cluster for high availability
4. **Frontend**: Deploy to CDN (Vercel, CloudFlare Pages)

### Load Balancer Configuration

For multiple API instances, update nginx upstream:

```nginx
upstream api {
    least_conn;
    server api1:3001 weight=5;
    server api2:3001 weight=5;
    server api3:3001 backup;
}
```

### Database Read Replicas

Update Prisma for read replicas:

```env
DATABASE_URL="postgresql://user:pass@primary:5432/agrotrack"
DATABASE_REPLICA_URL="postgresql://user:pass@replica:5432/agrotrack"
```

---

## Security Checklist

- [ ] All secrets stored in environment variables (not in code)
- [ ] Database accessible only from internal network
- [ ] Redis password protected
- [ ] HTTPS enforced everywhere
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Security headers configured (Helmet.js)
- [ ] Regular security updates scheduled
- [ ] Intrusion detection system (fail2ban)
- [ ] WAF enabled (CloudFlare, AWS WAF)
- [ ] Regular penetration testing
- [ ] Audit logging enabled

---

## Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check if database is running
docker-compose ps db

# Check connection
docker-compose exec api npx prisma db pull
```

**Redis connection refused**
```bash
# Test Redis connection
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping
```

**API not responding**
```bash
# Check logs
docker-compose logs --tail=100 api

# Restart service
docker-compose restart api
```

**SSL certificate issues**
```bash
# Check certificate validity
openssl s_client -connect api.agrotrack.ng:443 -servername api.agrotrack.ng

# Renew certificates
certbot renew --force-renewal
```
