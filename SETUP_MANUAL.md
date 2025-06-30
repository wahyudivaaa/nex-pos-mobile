# Manual Setup Guide - NexPOS Mobile

Jika terjadi masalah dengan automated setup, ikuti panduan manual berikut untuk membuat file-file yang diperlukan.

## 1. File Struktur yang Harus Dibuat

### `/config/firebase.js`

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;
```

### `/constants/Colors.js`

```javascript
export const Colors = {
  primary: "#1e3a8a",
  primaryDark: "#1e293b",
  primaryLight: "#3b82f6",
  background: "#0f172a",
  surface: "#1e293b",
  card: "#334155",
  modal: "#475569",
  text: "#f1f5f9",
  textSecondary: "#cbd5e1",
  textMuted: "#94a3b8",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  accent: "#06b6d4",
  accentLight: "#22d3ee",
  border: "#475569",
  borderLight: "#64748b",
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
};

export default Colors;
```

### `/components/ui/Button.js`

```javascript
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../../constants/Colors";

const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];

    switch (variant) {
      case "primary":
        baseStyle.push(styles.primary);
        break;
      case "secondary":
        baseStyle.push(styles.secondary);
        break;
      case "success":
        baseStyle.push(styles.success);
        break;
      case "warning":
        baseStyle.push(styles.warning);
        break;
      case "error":
        baseStyle.push(styles.error);
        break;
      case "outline":
        baseStyle.push(styles.outline);
        break;
      default:
        baseStyle.push(styles.primary);
    }

    if (disabled) {
      baseStyle.push(styles.disabled);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`${size}Text`]];

    if (variant === "outline") {
      baseTextStyle.push(styles.outlineText);
    } else {
      baseTextStyle.push(styles.primaryText);
    }

    if (disabled) {
      baseTextStyle.push(styles.disabledText);
    }

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? Colors.primary : Colors.white}
        />
      ) : (
        <>
          {icon && icon}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.surface,
  },
  success: {
    backgroundColor: Colors.success,
  },
  warning: {
    backgroundColor: Colors.warning,
  },
  error: {
    backgroundColor: Colors.error,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  disabled: {
    backgroundColor: Colors.border,
    opacity: 0.6,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  primaryText: {
    color: Colors.white,
  },
  outlineText: {
    color: Colors.primary,
  },
  disabledText: {
    color: Colors.textMuted,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});

export default Button;
```

### `/App.js` (Update yang ada)

```javascript
import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <StatusBar style="light" backgroundColor="#0f172a" />
        <AppNavigator />
      </DataProvider>
    </AuthProvider>
  );
}
```

## 2. Dependencies yang Dibutuhkan

Pastikan `package.json` memiliki dependencies berikut:

```json
{
  "dependencies": {
    "@expo/vector-icons": "^14.1.0",
    "@react-navigation/bottom-tabs": "^7.3.10",
    "@react-navigation/native": "^7.1.6",
    "@react-navigation/stack": "^7.1.1",
    "@react-native-async-storage/async-storage": "^2.1.0",
    "expo": "~53.0.13",
    "expo-linear-gradient": "~14.1.4",
    "expo-image-picker": "~16.1.2",
    "expo-print": "~13.1.5",
    "expo-sharing": "~13.1.4",
    "firebase": "^10.7.1",
    "react": "19.0.0",
    "react-native": "0.79.4",
    "react-native-chart-kit": "^6.12.0",
    "react-native-elements": "^3.4.3",
    "react-native-gesture-handler": "~2.24.0",
    "react-native-modal": "^13.0.1",
    "react-native-paper": "^5.12.3",
    "react-native-reanimated": "~3.17.4",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "~4.11.1",
    "react-native-svg": "15.8.0",
    "react-native-vector-icons": "^10.0.3"
  }
}
```

## 3. Context Files

### `/context/AuthContext.js`

```javascript
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserRole(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        setUserRole(userData.role);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userRole,
    userProfile,
    loading,
    login,
    logout,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## 4. Instruksi Install & Run

1. **Install dependencies:**

```bash
cd POS-Cashier-Mobile
npm install
```

2. **Setup Firebase project dan update config**

3. **Buat dummy screens untuk testing:**

```bash
mkdir -p screens
touch screens/DashboardScreen.js
touch screens/ProductsScreen.js
touch screens/TransactionsScreen.js
touch screens/NewTransactionScreen.js
touch screens/ReportsScreen.js
touch screens/ProfileScreen.js
touch screens/SettingsScreen.js
```

4. **Run aplikasi:**

```bash
npm start
```

## 5. Troubleshooting

### Jika ada error Firebase:

- Pastikan konfigurasi Firebase sudah benar
- Enable Authentication dan Firestore di Firebase Console
- Periksa Firestore rules

### Jika ada error dependencies:

```bash
npm install --legacy-peer-deps
```

### Jika ada error Metro bundler:

```bash
npx expo start --clear
```

### Untuk Android development:

- Install Android Studio
- Setup Android SDK
- Enable USB debugging pada device

### Untuk iOS development (macOS only):

- Install Xcode
- Install iOS Simulator

## 6. Firebase Rules

Setup Firestore rules untuk security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users dapat mengakses dokumen mereka sendiri
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Produk dan kategori dapat dibaca semua user yang authenticated
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Transaksi
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }

    match /transactionDetails/{detailId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Dengan mengikuti panduan manual ini, Anda dapat membuat aplikasi NexPOS Mobile yang lengkap dengan semua fitur yang diperlukan.
