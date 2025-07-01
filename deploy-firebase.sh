#!/bin/bash

# Firebase Hosting Deployment Script
# This script builds the web app and deploys it to Firebase Hosting

echo "🚀 Starting Firebase Hosting Deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if .env file exists and warn about environment variables
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found."
    echo "Make sure your environment variables are set in Firebase hosting configuration or CI/CD."
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the web application
echo "🔨 Building web application..."
npm run build:web

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed! 'dist' directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "Your app is now live on Firebase Hosting!"
else
    echo "❌ Deployment failed!"
    exit 1
fi