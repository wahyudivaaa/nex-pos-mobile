import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Konfigurasi Firebase
// GANTI dengan konfigurasi Firebase project Anda
const firebaseConfig = {
    apiKey: "AIzaSyBtsqv3dRAHWIHWAI7tfLDs8d6Q53VmKH0",
    authDomain: "nex-pos-mobile.firebaseapp.com",
    projectId: "nex-pos-mobile",
    storageBucket: "nex-pos-mobile.firebasestorage.app",
    messagingSenderId: "211854345507",
    appId: "1:211854345507:web:a0e471c3055f1c48e5f896",
    measurementId: "G-HX2T9LN4ET"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app;