#!/bin/bash

# One-Click Bootstrap for LIS Agent
echo "🚀 Initializing Liquidity Intents SDK Agent..."

# 1. Check Dependencies
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Node/NPM not found."
    exit 1
fi

# 2. Configure Environment
ENV_FILE="liquidity-intents-sdk/v0/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  .env not found. Creating from example..."
    cp "liquidity-intents-sdk/v0/.env.example" "$ENV_FILE"
    # Generate random key for session/security if needed
    echo "generated_session_secret" >> "$ENV_FILE"
    # Prompt for Key if interactive, else use Mock
    # For automated demo, we might skip this or inject a dummy that gets funded
    echo "SELLER_PRIVATE_KEY=0x$(openssl rand -hex 32)" >> "$ENV_FILE"
    echo "LIS_MODE=TESTNET" >> "$ENV_FILE"
fi

# 3. Build and Launch
echo "🏗️  Building Containers..."
docker compose build

echo "🟢 Starting Services..."
docker compose up -d

# 4. Open Dashboard
echo "Waiting for services..."
sleep 10
echo "🎉 Deployment Complete!"
echo "👉 Dashboard: http://localhost:5173"

if [[ "$OSTYPE" == "msys" ]]; then
    start http://localhost:5173
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:5173
else
    xdg-open http://localhost:5173
fi
