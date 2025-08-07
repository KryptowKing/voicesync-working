#!/bin/bash

echo "🚀 VoiceSync GitHub Deployment"
echo "Server: $(hostname -I | awk '{print $1}')"
echo ""

# Clean existing processes
echo "🧹 Cleaning existing processes..."
sudo pkill -9 -f node 2>/dev/null || true
sudo pkill -9 -f puppeteer 2>/dev/null || true
sudo pkill -9 -f chrome 2>/dev/null || true
sleep 2

# Install Node.js 18 if needed
if ! command -v node &> /dev/null || [[ $(node --version | cut -d'.' -f1 | sed 's/v//') -lt 18 ]]; then
    echo "📦 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✅ Node.js: $(node --version)"
echo "✅ NPM: $(npm --version)"

# Install system dependencies for Puppeteer
echo "📦 Installing system dependencies..."
sudo apt-get update
npm run install-deps

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install --no-audit --no-fund

# Test Puppeteer
echo "🧪 Testing Puppeteer..."
node -e "
const puppeteer = require('puppeteer');
console.log('✅ Puppeteer test passed');
" || {
    echo "⚠️ Puppeteer test failed but continuing..."
}

# Start the server
echo "🚀 Starting VoiceSync server..."
sudo node server.js &

sleep 3

# Test server response
if curl -s http://localhost > /dev/null 2>&1; then
    echo ""
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "🌐 Dashboard: http://$(hostname -I | awk '{print $1}')"
    echo "👤 Login: KryptowKing / crypto2024"
    echo "💰 Target: $150-300 daily earnings"
    echo "🎯 Ready for survey automation!"
    echo ""
else
    echo "⚠️ Server starting... may need a moment"
fi
