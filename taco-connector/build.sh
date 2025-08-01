#!/bin/bash

# TACO Connector Build Script
# This script builds and packages the Dynamic Report Connector

set -e

echo "🚀 Building Dynamic Report Connector..."

# Check if TACO toolkit is installed
if ! command -v taco &> /dev/null; then
    echo "❌ TACO toolkit not found. Installing..."
    npm install -g @tableau/taco-toolkit
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf build/
mkdir -p build/

# Build the connector
echo "🔨 Building connector..."
taco build

# Package the connector
echo "📦 Packaging connector..."
taco package

echo "✅ Build completed successfully!"
echo "📁 Connector package: build/DynamicReportConnector.taco"

# Instructions for installation
echo ""
echo "📋 Installation Instructions:"
echo "1. Copy the .taco file to your Tableau Connectors directory:"
echo "   Windows: C:\\Users\\[User]\\Documents\\My Tableau Repository\\Connectors"
echo "   macOS: /Users/[user]/Documents/My Tableau Repository/Connectors"
echo "2. Restart Tableau Desktop"
echo "3. The connector will appear in the connector list"
echo ""
echo "�� Happy connecting!" 