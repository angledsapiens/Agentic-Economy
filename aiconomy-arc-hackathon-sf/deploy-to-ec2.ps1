#!/usr/bin/env pwsh
# LIS EC2 Deployment Script
# Usage: .\deploy-to-ec2.ps1

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  LIS Production Deployment to EC2" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Cyan

$PROJECT_ROOT = "D:\Projects\Agentic Treasury\aiconomy-arc-hackathon-sf"
$PEM_FILE = "D:\Projects\Agentic Treasury\spotr.pem"
$EC2_HOST = "ubuntu@13.215.194.63"

# Step 0: Fix PEM permissions
Write-Host "[0/6] Fixing PEM permissions..." -ForegroundColor Yellow
icacls $PEM_FILE /inheritance:r | Out-Null
icacls $PEM_FILE /grant:r "$env:USERNAME:(R)" | Out-Null
Write-Host "  ✅ PEM permissions set`n" -ForegroundColor Green

# Step 1: Build locally
Write-Host "[1/6] Building application..." -ForegroundColor Yellow
Set-Location $PROJECT_ROOT
npm run build
Write-Host "  ✅ Build complete`n" -ForegroundColor Green

# Step 2: Create deployment archive
Write-Host "[2/6] Creating deployment archive..." -ForegroundColor Yellow
if (Test-Path "lis-deploy.tar.gz") {
    Remove-Item "lis-deploy.tar.gz"
}

tar -czf lis-deploy.tar.gz `
  --exclude=node_modules `
  --exclude=.git `
  --exclude=data `
  --exclude="*.db" `
  src/ `
  dist/ `
  scripts/ `
  package.json `
  package-lock.json `
  tsconfig.json `
  .env.production

Write-Host "  ✅ Archive created: lis-deploy.tar.gz`n" -ForegroundColor Green

# Step 3: Copy to EC2
Write-Host "[3/6] Uploading to EC2..." -ForegroundColor Yellow
scp -i $PEM_FILE lis-deploy.tar.gz ${EC2_HOST}:~/
Write-Host "  ✅ Upload complete`n" -ForegroundColor Green

# Step 4: Extract and prepare on EC2
Write-Host "[4/6] Extracting on EC2..." -ForegroundColor Yellow
ssh -i $PEM_FILE $EC2_HOST @"
    echo '=== Extracting deployment package ==='
    mkdir -p ~/lis-app
    cd ~/lis-app
    tar -xzf ~/lis-deploy.tar.gz
    echo '✅ Extraction complete'
"@
Write-Host "  ✅ Extraction complete`n" -ForegroundColor Green

# Step 5: Install dependencies and deploy
Write-Host "[5/6] Installing dependencies on EC2..." -ForegroundColor Yellow
ssh -i $PEM_FILE $EC2_HOST @"
    cd ~/lis-app
    echo '=== Installing dependencies ==='
    npm install --production

    echo '=== Setting up environment ==='
    cp .env.production .env

    echo '=== Installing PM2 (if not present) ==='
    npm list -g pm2 || sudo npm install -g pm2

    echo '=== Starting LIS server ==='
    pm2 restart lis-server || pm2 start 'npx tsx src/server.ts' --name lis-server
    pm2 save

    echo '✅ Deployment complete'
    echo ''
    pm2 status
"@
Write-Host "  ✅ Server started`n" -ForegroundColor Green

# Step 6: Verify deployment
Write-Host "[6/6] Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "http://13.215.194.63:3001/api/treasury" -UseBasicParsing
    Write-Host "  ✅ API responding: $($response.StatusCode)`n" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  API not responding yet (may need firewall configuration)`n" -ForegroundColor Yellow
}

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ Deployment Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "LIS Server URL: http://13.215.194.63:3001" -ForegroundColor White
Write-Host "`nEndpoints:" -ForegroundColor White
Write-Host "  - http://13.215.194.63:3001/api/activity" -ForegroundColor Cyan
Write-Host "  - http://13.215.194.63:3001/api/transactions" -ForegroundColor Cyan
Write-Host "  - http://13.215.194.63:3001/api/treasury" -ForegroundColor Cyan
Write-Host "`nView logs on EC2:" -ForegroundColor White
Write-Host "  ssh -i $PEM_FILE $EC2_HOST 'pm2 logs lis-server'" -ForegroundColor Gray

Write-Host "`n✨ Ready for production!" -ForegroundColor Green
