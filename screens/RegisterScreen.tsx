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
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface RegisterScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const { register } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Nama minimal 3 karakter';
    }

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

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await register(email.trim(), password, name.trim());

      if (result.success) {
        Alert.alert(
          'Pendaftaran Berhasil', 
          'Akun Anda telah dibuat. Selamat datang di NexPOS!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Dashboard')
            }
          ]
        );
      } else {
        Alert.alert('Pendaftaran Gagal', result.error || 'Terjadi kesalahan saat mendaftar');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan yang tidak terduga');
    } finally {
      setLoading(false);
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
                name="person-add"
                size={60}
                color={Colors.accent}
              />
            </View>
            <Text style={styles.title}>Daftar Akun Baru</Text>
            <Text style={styles.subtitle}>Bergabung dengan NexPOS</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Buat Akun Anda</Text>

            <Input
              label="Nama Lengkap"
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama lengkap Anda"
              autoCapitalize="words"
              error={errors.name}
            />

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

            <Input
              label="Konfirmasi Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Konfirmasi password Anda"
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title="Daftar"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Sudah punya akun? </Text>
              <Button
                title="Masuk Sekarang"
                variant="outline"
                size="small"
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
              />
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
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
  } as ViewStyle,
  loginSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  } as ViewStyle,
  loginText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  } as TextStyle,
  loginButton: {
    minWidth: 150,
  } as ViewStyle,
});

export default RegisterScreen; 