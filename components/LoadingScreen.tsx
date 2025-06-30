import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const Colors = {
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  accent: '#06b6d4',
};

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Memuat aplikasi...' 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons 
            name="storefront" 
            size={60} 
            color={Colors.accent} 
          />
        </View>
        
        <Text style={styles.title}>NexPOS Mobile</Text>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={Colors.accent} 
            style={styles.spinner}
          />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default LoadingScreen;