# NexPOS Mobile - Aplikasi POS Mobile Modern

🚀 **Aplikasi Point of Sale (POS) mobile berbasis React Native dan Expo dengan TypeScript**

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![Framework](https://img.shields.io/badge/Framework-React%20Native%20%7C%20Expo-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Firebase](https://img.shields.io/badge/Backend-Firebase-orange)

## ✨ Fitur Utama

### 📱 Multi-Platform Support

- **iOS & Android**: Native mobile experience
- **Web**: Responsive web application
- **Progressive Web App (PWA)**: Installable web app

### 🔐 Sistem Autentikasi

- Login & Register dengan Firebase Auth
- Role-based access (Admin & Kasir)
- Secure session management
- Password reset functionality

### 📊 Dashboard Analytics

- Real-time sales metrics
- Revenue tracking dengan growth indicators
- Recent transactions feed
- Top products ranking
- Interactive charts dan statistics

### 🛍️ Manajemen Produk

- **CRUD Operations**: Create, Read, Update, Delete products
- **Image Management**: Upload product images
- **Barcode Support**: Product barcode scanning
- **Category Management**: Organize products by categories
- **Stock Management**: Track inventory levels
- **Bulk Operations**: Select dan manage multiple products
- **Advanced Filtering**: Search by name, category, stock status

### 💰 Sistem Transaksi

- **POS Interface**: User-friendly cashier interface
- **Multiple Payment Methods**: Cash, Card, Digital wallet
- **Receipt Generation**: PDF receipts dengan QR codes
- **Transaction History**: Complete transaction tracking
- **Real-time Updates**: Live transaction monitoring

### 📈 Reporting & Analytics

- **Sales Reports**: Daily, weekly, monthly reports
- **Financial Reports**: Revenue dan profit analysis
- **Inventory Reports**: Stock levels dan movements
- **Export Functions**: PDF dan Excel exports
- **Visual Charts**: Interactive data visualization

### ⚙️ Pengaturan & Konfigurasi

- **User Management**: Admin dapat manage users
- **App Settings**: Dark mode, notifications, preferences
- **Backup & Restore**: Data backup functionality
- **Multi-language Support**: Indonesian dan English

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 atau lebih baru)
- npm atau yarn
- Expo CLI
- Firebase account

### Installation

1. **Clone repository**

```bash
git clone https://github.com/wahyudivaaa/nex-pos-mobile.git
cd nex-pos-mobile
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup Firebase**

```bash
# Copy template konfigurasi Firebase
cp config/firebase.example.ts config/firebase.ts
```

Edit `config/firebase.ts` dengan kredensial Firebase Anda:

```typescript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

4. **Start development server**

```bash
# Mobile development
npm start

# Web development
npm run web

# Android
npm run android

# iOS (macOS only)
npm run ios
```

## 🌐 Deployment

### Deploy ke Vercel (Web)

1. **Install Vercel CLI**

```bash
npm i -g vercel
```

2. **Deploy**

```bash
vercel --prod
```

Atau connect repository GitHub ke Vercel dashboard untuk auto-deployment.

### Build untuk Production

```bash
# Web build
npm run build:web

# Android APK
expo build:android

# iOS App Store
expo build:ios
```

## 📁 Struktur Project

```
pos-cashier-mobile/
├── app/                    # Expo Router pages
├── components/             # Reusable components
│   └── ui/                # UI components
├── screens/               # Screen components
├── navigation/            # Navigation setup
├── context/               # React Context providers
├── types/                 # TypeScript type definitions
├── config/                # Configuration files
├── assets/                # Images, fonts, etc.
└── constants/             # App constants
```

## 🔧 Teknologi yang Digunakan

### Frontend

- **React Native**: Framework mobile
- **Expo**: Development platform
- **TypeScript**: Type safety
- **React Navigation**: Navigation library
- **React Native Elements**: UI components
- **React Native Paper**: Material Design components

### Backend & Services

- **Firebase Auth**: Authentication
- **Firestore**: Database
- **Firebase Storage**: File storage
- **Firebase Analytics**: App analytics

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Metro**: JavaScript bundler
- **Vercel**: Web deployment

## 📱 Screenshots

### Mobile Interface

- Dashboard dengan analytics real-time
- Product management dengan image upload
- Transaction processing interface
- Reports dan charts

### Web Interface

- Responsive design untuk desktop
- Touch-friendly untuk tablet
- PWA support untuk mobile web

## 🔒 Keamanan

- Secure Firebase authentication
- Role-based access control
- Input validation dan sanitization
- Secure data transmission dengan HTTPS
- Local data encryption

## 📊 Performance

- Optimized untuk performa mobile
- Lazy loading untuk components
- Image optimization
- Efficient state management
- Minimal bundle size

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📧 Email: support@nexpos.com
- 📱 WhatsApp: +62 xxx xxxx xxxx
- 🌐 Website: https://nexpos-mobile.vercel.app

## 🙏 Acknowledgments

- React Native team untuk framework yang amazing
- Expo team untuk development tools
- Firebase team untuk backend services
- Open source community untuk semua dependencies

---

**Dibuat dengan ❤️ oleh Tim NexPOS**

⭐ **Star repository ini jika bermanfaat!**
