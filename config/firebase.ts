import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Konfigurasi Firebase
// Ganti dengan konfigurasi Firebase project Anda
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBtsqv3dRAHWIHWAI7tfLDs8d6Q53VmKH0",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "nex-pos-mobile.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "nex-pos-mobile",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "nex-pos-mobile.firebasestorage.app",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "211854345507",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:211854345507:web:a0e471c3055f1c48e5f896",
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-HX2T9LN4ET"
};

// Check if Firebase config is properly set
const isProductionConfig = 
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY && 
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID &&
    !process.env.EXPO_PUBLIC_FIREBASE_API_KEY.includes('demo');

if (!isProductionConfig) {
    console.warn('⚠️ Firebase Config Warning: Using demo configuration. Please set proper environment variables for production.');
    console.log('📋 Required environment variables:');
    console.log('   - EXPO_PUBLIC_FIREBASE_API_KEY');
    console.log('   - EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
    console.log('   - EXPO_PUBLIC_FIREBASE_PROJECT_ID');
    console.log('   - EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET');
    console.log('   - EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
    console.log('   - EXPO_PUBLIC_FIREBASE_APP_ID');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services dengan error handling
let auth, db, storage;

try {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
} catch (error) {
    console.error('Firebase initialization error:', error);
    // Untuk development, buat mock objects
    if (!isProductionConfig) {
        console.log('🔧 Running in demo mode - Firebase features will be limited');
    }
}

export { auth, db, storage, isProductionConfig };
export default app;