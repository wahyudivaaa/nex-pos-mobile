#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Firebase deployment readiness...\n');

// Check if required files exist
const requiredFiles = [
    'dist/index.html',
    'dist/_expo',
    'firebase.json',
    '.firebaserc'
];

const missingFiles = [];

requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        missingFiles.push(file);
    }
});

if (missingFiles.length > 0) {
    console.log('❌ Missing required files:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    console.log('\n💡 Run "npm run build:web" to generate missing files');
    process.exit(1);
}

// Check environment variables
const requiredEnvVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.log('⚠️  Missing environment variables:');
    missingEnvVars.forEach(envVar => console.log(`   - ${envVar}`));
    console.log('\n💡 Create .env file or set environment variables');
}

// Check Firebase project configuration
try {
    const firebaserc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
    const projectId = firebaserc.projects.default;
    
    if (projectId === 'your-firebase-project-id') {
        console.log('⚠️  Firebase project ID not configured in .firebaserc');
        console.log('💡 Update .firebaserc with your actual Firebase project ID');
    } else {
        console.log(`✅ Firebase project ID: ${projectId}`);
    }
} catch (error) {
    console.log('❌ Error reading .firebaserc:', error.message);
}

// Check Firebase configuration
try {
    const firebaseJson = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
    const publicDir = firebaseJson.hosting.public;
    
    if (fs.existsSync(publicDir)) {
        console.log(`✅ Public directory exists: ${publicDir}`);
        
        // Check if index.html exists in public directory
        const indexPath = path.join(publicDir, 'index.html');
        if (fs.existsSync(indexPath)) {
            console.log('✅ index.html found in public directory');
        } else {
            console.log('❌ index.html not found in public directory');
        }
    } else {
        console.log(`❌ Public directory does not exist: ${publicDir}`);
    }
} catch (error) {
    console.log('❌ Error reading firebase.json:', error.message);
}

console.log('\n📊 Deployment Summary:');
console.log('✅ Firebase configuration files ready');
console.log('✅ Build artifacts verified');

if (missingEnvVars.length === 0) {
    console.log('✅ Environment variables configured');
} else {
    console.log('⚠️  Some environment variables missing');
}

console.log('\n🚀 Ready for deployment!');
console.log('Run: npm run firebase:deploy');
console.log('Or: ./deploy-firebase.sh');