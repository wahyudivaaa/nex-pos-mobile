import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Konfigurasi Firebase - TEMPLATE
// 1. Buat project Firebase di https://console.firebase.google.com/
// 2. Salin konfigurasi dari project settings
// 3. Ganti konfigurasi di bawah dengan konfigurasi project Anda
// 4. Rename file ini menjadi firebase.ts

const firebaseConfig = {
    apiKey: "AIzaSyExample-API-Key-Replace-This-With-Your-Key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
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