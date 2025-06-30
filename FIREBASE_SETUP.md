# Setup Firebase untuk NexPOS Mobile

## Error yang Terjadi:

Error API key not valid menunjukkan masalah setup Firebase.

## Konfigurasi Sudah Benar

File `config/firebase.ts` sudah memiliki konfigurasi yang valid untuk project `nex-pos-mobile`.

## Yang Perlu Dicek di Firebase Console:

### 1. Buka Firebase Console

- Pergi ke https://console.firebase.google.com/
- Login dan pilih project `nex-pos-mobile`

### 2. Aktifkan Authentication

- Klik **Authentication** di sidebar
- Tab **Sign-in method**
- **Aktifkan Email/Password**

### 3. Setup Firestore Database

- Klik **Firestore Database**
- Jika belum ada, klik "Create database"
- Pilih **Start in test mode**

### 4. Test Rules Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Buat Test User

Di Firebase Console > Authentication > Users:

- Email: `admin@nexpos.com`
- Password: `password123`

## Quick Fix:

1. Pastikan Authentication dan Firestore aktif
2. Buat user test di Firebase Console
3. Test login dengan credentials tersebut

Jika masih error, regenerate API key di Project Settings.
