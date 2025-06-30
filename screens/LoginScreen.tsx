import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Colors = {
  primary: '#1e3a8a',
  primaryDark: '#1e293b',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  success: '#10b981',
  error: '#ef4444',
  accent: '#06b6d4',
  border: '#475569',
  white: '#ffffff',
};

interface FormErrors {
  email?: string;
  password?: string;
}

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('admin@nexpos.com');
  const [password, setPassword] = useState<string>('password123');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const { login } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!password.trim()) {
      newErrors.password = 'Password wajib diisi';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        Alert.alert('Login Berhasil', 'Selamat datang di NexPOS!');
      } else {
        Alert.alert('Login Gagal', result.error || 'Terjadi kesalahan saat login');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan yang tidak terduga');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'kasir'): void => {
    if (role === 'admin') {
      setEmail('admin@nexpos.com');
      setPassword('password123');
    } else {
      setEmail('kasir@nexpos.com');
      setPassword('password123');
    }
  };

  return (
    <LinearGradient
      colors={[Colors.background, Colors.primaryDark, Colors.primary]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons
                name="storefront"
                size={60}
                color={Colors.accent}
              />
            </View>
            <Text style={styles.title}>NexPOS Mobile</Text>
            <Text style={styles.subtitle}>Sistem Point of Sale Modern</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Masuk ke Akun Anda</Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Masukkan email Anda"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Masukkan password Anda"
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Masuk"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <View style={styles.registerSection}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <Button
                title="Daftar Sekarang"
                variant="outline"
                size="small"
                onPress={() => navigation.navigate('Register')}
                style={styles.registerButton}
              />
            </View>

            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Demo Login:</Text>
              <View style={styles.demoButtonsContainer}>
                <Button
                  title="Admin"
                  variant="outline"
                  size="small"
                  onPress={() => handleDemoLogin('admin')}
                  style={styles.demoButton}
                />
                <Button
                  title="Kasir"
                  variant="outline"
                  size="small"
                  onPress={() => handleDemoLogin('kasir')}
                  style={styles.demoButton}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  keyboardAvoidingView: {
    flex: 1,
  } as ViewStyle,
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  } as ViewStyle,
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  } as ViewStyle,
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  } as ViewStyle,
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  } as TextStyle,
  formContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  } as ViewStyle,
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  } as TextStyle,
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  } as ViewStyle,
  registerSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  } as ViewStyle,
  registerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  } as TextStyle,
  registerButton: {
    minWidth: 150,
  } as ViewStyle,
  demoSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  } as ViewStyle,
  demoTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  } as TextStyle,
  demoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,
  demoButton: {
    flex: 1,
    marginHorizontal: 4,
  } as ViewStyle,
});

export default LoginScreen; 