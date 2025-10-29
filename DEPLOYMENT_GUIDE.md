# Linux Server Deployment Guide

Complete guide for deploying the Excel SaaS platform on a Linux server.

## Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Root or sudo access
- Domain name (optional but recommended)
- At least 2GB RAM, 20GB storage

## Option 1: Docker Deployment (Recommended)

### Step 1: Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Prepare Application

```bash
# Clone or upload your application
cd /var/www
sudo mkdir excel-saas
sudo chown $USER:$USER excel-saas
cd excel-saas

# Upload your files (use git, scp, or ftp)
# If using git:
git clone <your-repo-url> .

# Or upload via SCP from local machine:
# scp -r ./excel-saas/* user@your-server:/var/www/excel-saas/
```

### Step 3: Configure Environment

```bash
# Create .env file
nano .env
```

Add the following:

```env
DATABASE_URL="postgresql://excel_user:excel_password@postgres:5432/excel_saas?schema=public"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-a-secure-random-string-here"
NODE_ENV="production"
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### Step 4: Deploy with Docker

```bash
# Build and start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

### Step 5: Set Up Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create site configuration
sudo nano /etc/nginx/sites-available/excel-saas
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/excel-saas /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal:
sudo certbot renew --dry-run
```

### Step 7: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

## Option 2: Direct Deployment (Without Docker)

### Step 1: Install Node.js

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE excel_saas;
CREATE USER excel_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE excel_saas TO excel_user;
\q
```

### Step 3: Deploy Application

```bash
# Create app directory
sudo mkdir -p /var/www/excel-saas
sudo chown $USER:$USER /var/www/excel-saas
cd /var/www/excel-saas

# Upload or clone your application
# ... (same as Docker method)

# Install dependencies
npm ci --production

# Create .env file
nano .env
```

Add:

```env
DATABASE_URL="postgresql://excel_user:your_secure_password@localhost:5432/excel_saas?schema=public"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-generated-secret"
NODE_ENV="production"
```

### Step 4: Build Application

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build Next.js
npm run build
```

### Step 5: Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
pm2 start npm --name "excel-saas" -- start

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Follow the command it outputs

# Check status
pm2 status
pm2 logs excel-saas
```

### Step 6: Configure Nginx

Same as Docker method (Step 5 above)

### Step 7: Set Up SSL

Same as Docker method (Step 6 above)

## Post-Deployment Tasks

### 1. Test the Application

```bash
# Check if app is running
curl http://localhost:3000

# Check from browser
# Visit: https://yourdomain.com
```

### 2. Set Up Monitoring

```bash
# Install monitoring tools
sudo apt install htop -y

# Monitor Docker containers (if using Docker)
docker stats

# Monitor PM2 processes (if using PM2)
pm2 monit
```

### 3. Configure Backups

#### Database Backup Script

```bash
# Create backup script
sudo nano /usr/local/bin/backup-excel-saas.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/excel-saas"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker exec excel-saas-db pg_dump -U excel_user excel_saas > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable:

```bash
sudo chmod +x /usr/local/bin/backup-excel-saas.sh
```

#### Set Up Cron Job

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-excel-saas.sh
```

### 4. Set Up Log Rotation

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/excel-saas
```

Add:

```
/var/log/excel-saas/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### 5. Performance Optimization

#### Enable Nginx Caching

```bash
sudo nano /etc/nginx/sites-available/excel-saas
```

Add caching configuration:

```nginx
# Add at the top of server block
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=excel_cache:10m max_size=100m inactive=60m;

server {
    # ... existing config ...

    location /_next/static {
        proxy_cache excel_cache;
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header X-Cache-Status $upstream_cache_status;
    }

    location /static {
        proxy_cache excel_cache;
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

#### Enable Gzip Compression

```bash
sudo nano /etc/nginx/nginx.conf
```

Ensure these lines are uncommented:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
```

Restart Nginx:

```bash
sudo systemctl restart nginx
```

## Maintenance Commands

### Docker Deployment

```bash
# View logs
docker-compose logs -f app

# Restart application
docker-compose restart app

# Update application
git pull
docker-compose down
docker-compose build
docker-compose up -d

# Database backup
docker exec excel-saas-db pg_dump -U excel_user excel_saas > backup.sql

# Database restore
docker exec -i excel-saas-db psql -U excel_user excel_saas < backup.sql
```

### PM2 Deployment

```bash
# View logs
pm2 logs excel-saas

# Restart application
pm2 restart excel-saas

# Update application
cd /var/www/excel-saas
git pull
npm ci --production
npm run build
npx prisma migrate deploy
pm2 restart excel-saas

# Database backup
pg_dump -U excel_user excel_saas > backup.sql

# Database restore
psql -U excel_user excel_saas < backup.sql
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app  # Docker
pm2 logs excel-saas      # PM2

# Common issues:
# 1. Database connection - check DATABASE_URL
# 2. Port already in use - check port 3000
# 3. Missing environment variables - check .env file
```

### Database Connection Issues

```bash
# Test database connection
docker exec -it excel-saas-db psql -U excel_user -d excel_saas  # Docker
psql -U excel_user -d excel_saas  # Direct

# Check PostgreSQL is running
sudo systemctl status postgresql
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## Security Checklist

- [ ] Change default database passwords
- [ ] Generate secure NEXTAUTH_SECRET
- [ ] Enable firewall (ufw)
- [ ] Set up SSL/HTTPS
- [ ] Configure regular backups
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`
- [ ] Monitor logs regularly
- [ ] Set up fail2ban for SSH protection
- [ ] Use strong passwords
- [ ] Restrict database access to localhost only

## Scaling Considerations

### Horizontal Scaling

For high traffic, consider:

1. **Load Balancer**: Use Nginx or HAProxy
2. **Multiple App Instances**: Run multiple containers/PM2 instances
3. **Database Replication**: Set up PostgreSQL read replicas
4. **CDN**: Use Cloudflare or similar for static assets

### Vertical Scaling

- Increase server RAM for better performance
- Use SSD storage for database
- Optimize PostgreSQL configuration

## Monitoring & Alerts

### Set Up Uptime Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

### Application Performance Monitoring

Consider integrating:
- Sentry (error tracking)
- New Relic (performance)
- LogRocket (user sessions)

## Support

For deployment issues:
1. Check application logs
2. Review Nginx error logs
3. Verify environment variables
4. Test database connectivity
5. Check firewall rules

---

**Your Excel SaaS platform is now deployed and ready to serve customers! 🚀**
