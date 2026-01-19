# LIS Production Deployment to EC2

## Prerequisites
- EC2 Instance: `13.215.194.63`
- SSH Key: `spotr.pem` (in parent directory)
- PostgreSQL Database: Already configured at `13.215.194.63:5432/lis_transactions`

---

## Deployment Steps

### 1. Fix PEM Permissions (PowerShell)

```powershell
# Navigate to where spotr.pem is located
cd "D:\Projects\Agentic Treasury"

# Remove inheritance and grant only current user read access
icacls spotr.pem /inheritance:r
icacls spotr.pem /grant:r "$env:USERNAME:(R)"

# Verify permissions (should show only your user)
icacls spotr.pem
```

### 2. Test SSH Connection

```powershell
ssh -i spotr.pem ubuntu@13.215.194.63 "echo 'SSH connection successful'"
```

### 3. Prepare Deployment Package

```powershell
cd "D:\Projects\Agentic Treasury\aiconomy-arc-hackathon-sf"

# Create deployment archive
tar -czf lis-deploy.tar.gz `
  --exclude=node_modules `
  --exclude=.git `
  --exclude=data `
  src/ `
  scripts/ `
  package.json `
  package-lock.json `
  tsconfig.json `
  .env.production
```

### 4. Copy to EC2

```powershell
scp -i ..\spotr.pem lis-deploy.tar.gz ubuntu@13.215.194.63:~/
```

### 5. Deploy on EC2

```powershell
ssh -i ..\spotr.pem ubuntu@13.215.194.63
```

Once connected to EC2, run:

```bash
# Extract deployment
cd ~
tar -xzf lis-deploy.tar.gz -C lis-app || mkdir -p lis-app && tar -xzf lis-deploy.tar.gz -C lis-app

cd lis-app

# Install dependencies
npm install
npm install -g pm2

# Setup environment
cp .env.production .env

# Build TypeScript
npm run build

# Run database setup (already done, but safe to re-run)
npx tsx scripts/setup_database.ts

# Start with PM2 (Process Manager)
pm2 start "npx tsx src/server.ts" --name lis-server
pm2 save
pm2 startup

# View logs
pm2 logs lis-server
```

### 6. Verify Deployment

From your local machine:

```powershell
# Test the API
curl http://13.215.194.63:3001/api/activity
curl http://13.215.194.63:3001/api/transactions
curl http://13.215.194.63:3001/api/treasury
```

---

## Environment Variables on EC2

The `.env.production` file should contain:

```bash
LIS_MODE=TESTNET
ARC_RPC_URL=https://rpc.testnet.arc.network
ARC_USDC_CONTRACT=0x3600000000000000000000000000000000000000
SELLER_PRIVATE_KEY=0x6fcf0e19b820dbf6e3a5af77b2dc15a2d8d6cd0d0bbac15fe80dafb02e7e9c1c
DATABASE_URL=postgresql://postgres:Ashurbanipal1!@localhost:5432/lis_transactions
ERC8004_REGISTRY=0x2b63E8F0FaE1059e69FFeEAB82a60f1bDbde0E39
PORT=3001
NODE_ENV=production
```

**Note**: DATABASE_URL uses `localhost` on EC2 since PostgreSQL is on the same machine.

---

## PM2 Commands (on EC2)

```bash
# View status
pm2 status

# View logs
pm2 logs lis-server

# Restart
pm2 restart lis-server

# Stop
pm2 stop lis-server

# Monitor
pm2 monit
```

---

## Firewall Rules (if needed)

On EC2, ensure port 3001 is open:

```bash
# Check if ufw is active
sudo ufw status

# If active, allow port 3001
sudo ufw allow 3001/tcp
```

In AWS Console:
- Go to EC2 > Security Groups
- Find the security group for your instance
- Add Inbound Rule: Custom TCP, Port 3001, Source: 0.0.0.0/0 (or your IP)

---

## Update Observer UI to Point to EC2

In `app/.env` or `app/.env.production`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://13.215.194.63:3001
```

Then in `app/src/app/api/activity/route.ts`, `app/src/app/api/treasury/route.ts`, etc., use:

```typescript
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
```

---

## Quick Deployment Script (PowerShell)

Save as `deploy-to-ec2.ps1`:

```powershell
#!/usr/bin/env pwsh

Write-Host "=== LIS EC2 Deployment ===" -ForegroundColor Cyan

# Step 1: Build locally
Write-Host "`n[1/5] Building application..." -ForegroundColor Yellow
cd "D:\Projects\Agentic Treasury\aiconomy-arc-hackathon-sf"
npm run build

# Step 2: Create archive
Write-Host "`n[2/5] Creating deployment archive..." -ForegroundColor Yellow
tar -czf lis-deploy.tar.gz `
  --exclude=node_modules `
  --exclude=.git `
  --exclude=data `
  src/ dist/ scripts/ package*.json tsconfig.json .env.production

# Step 3: Copy to EC2
Write-Host "`n[3/5] Copying to EC2..." -ForegroundColor Yellow
scp -i ..\spotr.pem lis-deploy.tar.gz ubuntu@13.215.194.63:~/

# Step 4: Deploy on EC2
Write-Host "`n[4/5] Deploying on EC2..." -ForegroundColor Yellow
ssh -i ..\spotr.pem ubuntu@13.215.194.63 @"
  mkdir -p ~/lis-app
  tar -xzf ~/lis-deploy.tar.gz -C ~/lis-app
  cd ~/lis-app
  npm install --production
  cp .env.production .env
  pm2 restart lis-server || pm2 start 'npx tsx src/server.ts' --name lis-server
  pm2 save
"@

# Step 5: Verify
Write-Host "`n[5/5] Verifying deployment..." -ForegroundColor Yellow
curl http://13.215.194.63:3001/api/treasury

Write-Host "`n=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Access your LIS server at: http://13.215.194.63:3001" -ForegroundColor Green
```

Run with:
```powershell
.\deploy-to-ec2.ps1
```

---

## Troubleshooting

**SSH Permission Denied**:
- Check PEM permissions (should be read-only for your user)
- Ensure using correct key: `spotr.pem`

**Port 3001 not accessible**:
- Check EC2 Security Group rules
- Check `sudo ufw status` on EC2

**Database connection fails**:
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check DATABASE_URL in .env uses `localhost` not `13.215.194.63`

**PM2 not found**:
```bash
npm install -g pm2
```

---

## Rollback

If deployment fails:

```bash
pm2 stop lis-server
pm2 delete lis-server
# Fix issues, then redeploy
```
