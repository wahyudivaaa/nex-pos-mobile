# NexPOS Mobile - Point of Sale System

Aplikasi Point of Sale mobile yang komprehensif menggunakan React Native Expo dan Firebase sebagai backend database.

## 🚀 Fitur Utama

### 🔐 **Sistem Autentikasi**

- Login dengan email/password menggunakan Firebase Auth
- Role-based access control (Admin & Kasir)
- Persistent login dengan AsyncStorage
- Forgot password functionality

### 📊 **Dashboard Dinamis**

- Metrik real-time: Total pendapatan, jumlah transaksi, total produk
- Peringatan stok menipis
- Grafik pendapatan 7 hari terakhir
- Quick actions untuk transaksi baru

### 🛍️ **Manajemen Produk**

- CRUD operations untuk produk dan kategori
- Upload gambar produk
- Manajemen stok dengan alert minimum
- Pencarian dan filter produk

### 💰 **Sistem Transaksi**

- Interface POS mobile-friendly
- Shopping cart dengan real-time calculation
- Multiple payment methods (Cash, Card, QRIS)
- Auto-generate transaction numbers
- Receipt generation dan sharing

### 📈 **Laporan & Analytics**

- Laporan penjualan dengan filter periode
- Laporan inventaris dan stok
- Laporan keuangan dengan profit margin
- Export ke PDF dan Excel

### 🎨 **Design System**

- Dark navy theme sesuai dengan website
- Responsive design untuk semua device
- Modern UI components dengan gradients
- Smooth animations dan transitions

## 🛠️ Teknologi Stack

### Frontend

- **React Native** - Framework mobile cross-platform
- **Expo** - Development platform dan toolchain
- **React Navigation** - Navigasi antar screen
- **Expo Linear Gradient** - Gradient backgrounds
- **React Native Chart Kit** - Data visualization
- **React Native Vector Icons** - Icon set

### Backend & Database

- **Firebase Auth** - Authentication service
- **Firestore** - NoSQL database real-time
- **Firebase Storage** - File storage untuk gambar

### Libraries Utama

- **@react-native-async-storage/async-storage** - Local storage
- **expo-print** - PDF generation
- **expo-sharing** - File sharing
- **expo-image-picker** - Image upload
- **react-native-modal** - Modal dialogs

## 🏗️ Struktur Project

```
POS-Cashier-Mobile/
├── config/
│   └── firebase.js          # Konfigurasi Firebase
├── context/
│   ├── AuthContext.js       # Context untuk authentication
│   └── DataContext.js       # Context untuk data management
├── constants/
│   └── Colors.js            # Tema warna dark navy
├── components/
│   └── ui/
│       ├── Button.js        # Komponen button reusable
│       └── Input.js         # Komponen input reusable
├── screens/
│   ├── LoginScreen.js       # Screen login
│   ├── DashboardScreen.js   # Dashboard utama
│   ├── ProductsScreen.js    # Manajemen produk
│   ├── TransactionsScreen.js # Daftar transaksi
│   ├── NewTransactionScreen.js # Form transaksi baru
│   ├── ReportsScreen.js     # Laporan dan analytics
│   ├── ProfileScreen.js     # Profil pengguna
│   └── SettingsScreen.js    # Pengaturan aplikasi
├── navigation/
│   └── AppNavigator.js      # Setup navigasi utama
├── App.js                   # Entry point aplikasi
└── package.json            # Dependencies dan scripts
```

## 🔧 Setup & Installation

### Prerequisites

- Node.js (v14 atau lebih baru)
- npm atau yarn
- Expo CLI: `npm install -g @expo/cli`
- Android Studio (untuk Android development)
- Xcode (untuk iOS development - hanya di macOS)

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd POS-Cashier-Mobile
npm install
```

### 2. Setup Firebase

1. Buat project baru di [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication dengan Email/Password
3. Setup Firestore Database
4. Generate configuration dan update `config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
};
```

### 3. Setup Firestore Collections

Buat collections berikut di Firestore:

#### `users`

```javascript
{
  email: "admin@nexpos.com",
  name: "Administrator",
  role: "admin", // atau "kasir"
  createdAt: timestamp,
  lastLogin: timestamp
}
```

#### `categories`

```javascript
{
  name: "Makanan",
  description: "Kategori makanan",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `products`

```javascript
{
  name: "Nasi Goreng",
  description: "Nasi goreng spesial",
  price: 25000,
  stock: 100,
  alertStock: 10,
  categoryId: "category-id",
  imageUrl: "https://...",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `transactions`

```javascript
{
  transactionNumber: "TRX-1672531200000",
  userId: "user-id",
  totalAmount: 75000,
  paymentMethod: "cash", // cash, card, qris
  status: "completed",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `transactionDetails`

```javascript
{
  transactionId: "transaction-id",
  productId: "product-id",
  productName: "Nasi Goreng",
  quantity: 3,
  unitPrice: 25000,
  subtotal: 75000,
  createdAt: timestamp
}
```

### 4. Jalankan Aplikasi

```bash
# Development mode
npm start

# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

## 📱 User Guide

### Login

- **Admin**: Full access ke semua fitur
- **Kasir**: Akses terbatas pada transaksi dan view data

### Dashboard

- Lihat metrik utama dalam kartu berwarna
- Quick action untuk transaksi baru
- Grafik pendapatan real-time

### Transaksi Baru

1. Pilih produk dari grid atau gunakan search
2. Atur quantity untuk setiap item
3. Pilih metode pembayaran
4. Konfirmasi dan selesaikan transaksi
5. Generate receipt dan share

### Manajemen Produk (Admin Only)

- Tambah produk baru dengan foto
- Update stok dan harga
- Set alert minimum stock
- Kategorisasi produk

### Laporan (Admin Only)

- Filter berdasarkan periode
- Export ke PDF atau Excel
- Analisis penjualan dan profit

## 🎨 Design System

### Color Palette

```javascript
// Primary Colors
primary: '#1e3a8a',      // Navy blue
primaryDark: '#1e293b',   // Darker navy
primaryLight: '#3b82f6', // Lighter blue

// Status Colors
success: '#10b981',       // Green
warning: '#f59e0b',       // Yellow
error: '#ef4444',         // Red
accent: '#06b6d4',        // Cyan
```

### Typography

- **Headers**: Bold, 24px-32px
- **Body**: Regular, 16px
- **Captions**: 12px-14px
- **Font**: System default (San Francisco/Roboto)

### Components

- **Buttons**: Rounded corners, gradient backgrounds
- **Cards**: Subtle shadows, rounded corners
- **Inputs**: Focus states, validation feedback
- **Icons**: Ionicons, consistent sizing

## 🔒 Security Features

- **Authentication**: Firebase Auth dengan email verification
- **Data Validation**: Input sanitization dan validation
- **Role-based Access**: Middleware protection per screen
- **Secure Storage**: Encrypted local storage untuk tokens
- **API Security**: Firestore rules untuk data protection

## 📊 Performance

- **Real-time Updates**: Firestore listeners untuk data sync
- **Optimized Rendering**: React.memo dan lazy loading
- **Image Optimization**: Expo Image dengan caching
- **Bundle Size**: Code splitting dan tree shaking

## 🚀 Deployment

### Android (Google Play Store)

```bash
expo build:android
```

### iOS (App Store)

```bash
expo build:ios
```

### Over-the-Air Updates

```bash
expo publish
```

## 🔄 Data Flow

```
User Action → Component → Context → Firebase → Real-time Update → UI
```

1. User melakukan action (login, tambah produk, etc.)
2. Component memanggil function dari Context
3. Context melakukan operasi ke Firebase
4. Firebase mengirim real-time update
5. Context update state
6. UI re-render dengan data terbaru

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E testing
expo install detox
```

## 📦 Build & Release

### Production Build

```bash
# Android APK
eas build -p android

# iOS IPA
eas build -p ios
```

### App Store Submission

1. Update version di `app.json`
2. Build production version
3. Upload ke respective stores
4. Submit untuk review

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

- **Developer**: [Your Name]
- **Email**: [your.email@domain.com]
- **GitHub**: [github.com/yourusername]

## 🔮 Roadmap

### Version 2.0

- [ ] Barcode scanner integration
- [ ] Offline mode dengan sync
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Customer management
- [ ] Loyalty program
- [ ] Integration dengan hardware printer
- [ ] Multi-store support

### Version 1.1

- [ ] Push notifications
- [ ] Dark/Light theme toggle
- [ ] Backup/restore data
- [ ] Advanced search filters
- [ ] Batch operations

---

© 2024 NexPOS Mobile. All rights reserved.
