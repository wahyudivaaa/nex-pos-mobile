import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <DataProvider>
                    <StatusBar 
                        style="light" 
                        backgroundColor="#0f172a"
                        // Hide status bar on web to prevent layout issues
                        hidden={Platform.OS === 'web'}
                    />
                    <AppNavigator />
                </DataProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

// Register service worker for PWA functionality on web
if (Platform.OS === 'web') {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}