import { Ionicons } from '@expo/vector-icons';
import { Component, ErrorInfo, ReactNode } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const Colors = {
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  error: '#ef4444',
  accent: '#06b6d4',
  border: '#475569',
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In web environment, also log to console for debugging
    if (Platform.OS === 'web') {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: undefined });
    
    // For web, reload the page to ensure clean state
    if (Platform.OS === 'web') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons 
              name="warning-outline" 
              size={64} 
              color={Colors.error} 
              style={styles.icon}
            />
            <Text style={styles.title}>Oops! Terjadi Kesalahan</Text>
            <Text style={styles.message}>
              Aplikasi mengalami masalah teknis. Silakan coba restart aplikasi.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText}>{this.state.error.message}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.restartButton} 
              onPress={this.handleRestart}
            >
              <Ionicons name="refresh" size={20} color={Colors.text} />
              <Text style={styles.restartButtonText}>Restart Aplikasi</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  debugContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  restartButton: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  restartButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ErrorBoundary;