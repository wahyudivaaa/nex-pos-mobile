import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

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

if (!isProductionConfig && __DEV__) {
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
let app: any;
let auth: any;
let db: any;
let storage: any;

try {
    app = initializeApp(firebaseConfig);
    
    // Initialize Firebase services dengan error handling
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Web-specific Firebase optimizations
    if (Platform.OS === 'web') {
        // Enable offline persistence for web
        try {
            // Firestore persistence for web
            // This helps with loading performance on web
            import('firebase/firestore').then(({ enableNetwork, connectFirestoreEmulator }) => {
                // Only enable emulator in development
                if (__DEV__ && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
                    try {
                        connectFirestoreEmulator(db, 'localhost', 8080);
                    } catch (e) {
                        console.log('Firestore emulator already connected');
                    }
                }
            });
        } catch (error) {
            console.log('Firebase web optimizations failed:', error);
        }
    }
    
} catch (error) {
    console.error('Firebase initialization error:', error);
    
    // For web deployment, create fallback objects to prevent crashes
    if (Platform.OS === 'web') {
        console.error('🚨 Critical: Firebase failed to initialize on web platform');
        console.error('This will cause authentication and data features to fail');
        
        // Create minimal mock objects to prevent immediate crashes
        auth = null;
        db = null;
        storage = null;
    }
}

// Export null-safe Firebase instances
export { auth, db, isProductionConfig, storage };
export default app;

// Helper function to check if Firebase is properly initialized
export const isFirebaseInitialized = (): boolean => {
    return !!(auth && db && storage);
};

// Helper function to get Firebase error messages in Indonesian
export const getFirebaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'Email tidak terdaftar';
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Password salah';
        case 'auth/invalid-email':
            return 'Format email tidak valid';
        case 'auth/too-many-requests':
            return 'Terlalu banyak percobaan login. Coba lagi nanti';
        case 'auth/email-already-in-use':
            return 'Email sudah terdaftar';
        case 'auth/weak-password':
            return 'Password terlalu lemah (minimal 6 karakter)';
        case 'auth/network-request-failed':
            return 'Masalah koneksi internet. Periksa koneksi Anda';
        case 'firestore/unavailable':
            return 'Server database tidak tersedia. Coba lagi nanti';
        case 'firestore/permission-denied':
            return 'Akses ditolak. Periksa izin akun Anda';
        default:
            return 'Terjadi kesalahan. Silakan coba lagi';
    }
};