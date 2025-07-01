import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase Configuration
// All values must be provided via environment variables
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate that all required environment variables are set
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
    const errorMessage = `❌ Firebase Configuration Error: Missing required environment variables:\n${missingEnvVars.map(env => `   - ${env}`).join('\n')}\n\nPlease create a .env file or set these environment variables.`;
    
    console.error(errorMessage);
    
    if (__DEV__) {
        console.log('\n📋 How to fix this:');
        console.log('1. Create a .env file in your project root');
        console.log('2. Add your Firebase configuration values');
        console.log('3. Restart your development server');
        console.log('\nExample .env file:');
        console.log('EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here');
        console.log('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com');
        console.log('EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id');
        console.log('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app');
        console.log('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id');
        console.log('EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id');
    }
    
    throw new Error('Firebase configuration incomplete. Check environment variables.');
}

// Check if Firebase config is properly set
const isProductionConfig = 
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY && 
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID &&
    !process.env.EXPO_PUBLIC_FIREBASE_API_KEY.includes('demo');

if (!isProductionConfig && __DEV__) {
    console.warn('⚠️ Firebase Config Warning: Using demo configuration. Please set proper environment variables for production.');
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