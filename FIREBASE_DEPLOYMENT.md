# 🚀 Firebase Hosting Deployment Guide

Panduan lengkap untuk deploy aplikasi POS Cashier ke Firebase Hosting.

## 📋 Prerequisites

1. **Firebase Project**: Pastikan Anda sudah membuat Firebase project
2. **Node.js**: Version 18 atau lebih baru
3. **Firebase CLI**: Akan diinstall otomatis oleh script

## 🔧 Setup Firebase Project

### 1. Buat Firebase Project
1. Kunjungi [Firebase Console](https://console.firebase.google.com/)
2. Klik "Create a project" atau "Add project"
3. Ikuti langkah-langkah setup
4. Enable Authentication dan Firestore Database

### 2. Setup Firebase Configuration
1. Di Firebase Console, masuk ke Project Settings
2. Scroll ke bawah ke "Your apps" section
3. Klik "Add app" dan pilih Web (icon `</>`)
4. Register aplikasi dengan nama "POS Cashier Web"
5. Copy konfigurasi Firebase

### 3. Setup Environment Variables

Buat file `.env` di root project:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Update Firebase Project ID

Edit file `.firebaserc` dan ganti `your-firebase-project-id` dengan project ID yang sebenarnya:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

## 🚀 Deployment Options

### Option 1: Deployment Manual (Local)

```bash
# Install dependencies
npm install

# Build dan deploy
npm run firebase:build-deploy
```

Atau gunakan script otomatis:

```bash
# Buat script executable (hanya sekali)
chmod +x deploy-firebase.sh

# Jalankan deployment
./deploy-firebase.sh
```

### Option 2: Deployment Otomatis (GitHub Actions)

1. **Setup GitHub Secrets**:
   - Masuk ke repository GitHub Anda
   - Pergi ke Settings > Secrets and variables > Actions
   - Tambahkan secrets berikut:

   ```
   EXPO_PUBLIC_FIREBASE_API_KEY
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
   EXPO_PUBLIC_FIREBASE_PROJECT_ID
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   EXPO_PUBLIC_FIREBASE_APP_ID
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
   FIREBASE_SERVICE_ACCOUNT
   ```

2. **Generate Firebase Service Account**:
   ```bash
   # Login ke Firebase
   firebase login
   
   # Generate service account key
   firebase init hosting:github
   ```

3. **Push ke GitHub**:
   ```bash
   git add .
   git commit -m "Setup Firebase Hosting deployment"
   git push origin main
   ```

## 📱 Features Aplikasi Web

Aplikasi ini sudah dioptimalkan untuk web dengan fitur:

- ✅ **Progressive Web App (PWA)**: Bisa diinstall di desktop/mobile
- ✅ **Responsive Design**: Otomatis menyesuaikan layar
- ✅ **Offline Support**: Tetap bisa digunakan tanpa internet (terbatas)
- ✅ **Firebase Authentication**: Login/register dengan email
- ✅ **Real-time Database**: Data tersimpan dan tersinkron real-time
- ✅ **Cloud Storage**: Upload gambar produk ke Firebase Storage

## 🔧 Available Scripts

```bash
# Development
npm start              # Start Expo development server
npm run web           # Start web development server

# Build
npm run build         # Build untuk production
npm run build:web     # Build khusus web platform

# Firebase
npm run firebase:build           # Build web app
npm run firebase:deploy         # Deploy ke Firebase Hosting
npm run firebase:build-deploy   # Build + Deploy sekaligus

# Utilities
npm run clean         # Bersihkan build artifacts
npm run lint          # Check kode dengan ESLint
```

## 🌐 Setelah Deployment

Setelah berhasil deploy, aplikasi Anda akan tersedia di:
- **URL Hosting**: `https://your-project-id.web.app`
- **Custom Domain**: `https://your-project-id.firebaseapp.com`

### Setup Custom Domain (Opsional)

1. Di Firebase Console, masuk ke Hosting
2. Klik "Add custom domain"
3. Ikuti instruksi untuk setup DNS
4. Tunggu SSL certificate ter-generate otomatis

## 🔐 Security Setup

Aplikasi sudah dilengkapi dengan:

- **Firebase Security Rules**: Melindungi data di Firestore
- **Authentication Rules**: Hanya user yang login bisa akses data
- **Environment Variables**: Konfigurasi sensitif disembunyikan
- **HTTPS**: Enkripsi SSL/TLS otomatis

## 📞 Troubleshooting

### Build Gagal
```bash
# Bersihkan cache dan rebuild
npm run clean
npm install
npm run build:web
```

### Firebase CLI Error
```bash
# Login ulang Firebase
firebase logout
firebase login
```

### Environment Variables Tidak Terbaca
- Pastikan file `.env` ada di root project
- Restart development server setelah mengubah `.env`
- Untuk production, set environment variables di hosting provider

### Deploy Gagal
```bash
# Check Firebase project ID
firebase projects:list

# Pastikan sudah login
firebase whoami

# Re-initialize project
firebase use your-project-id
```

## 📈 Performance Tips

1. **Enable Gzip**: Firebase Hosting otomatis enable compression
2. **Cache Headers**: Sudah dikonfigurasi optimal di `firebase.json`
3. **Bundle Size**: Build sudah dioptimalkan dengan Metro bundler
4. **Image Optimization**: Gunakan format WebP untuk gambar

## 🆘 Support

Jika mengalami masalah:

1. Check console browser untuk error JavaScript
2. Check Firebase Console untuk error deployment
3. Pastikan semua environment variables sudah benar
4. Verify Firebase project configuration

---

**Happy Deploying! 🎉**