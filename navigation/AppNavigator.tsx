import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';

// Define Colors inline for consistency
const Colors = {
  primary: '#1e3a8a',
  primaryDark: '#1e293b',
  primaryLight: '#3b82f6',
  background: '#0f172a',
  surface: '#1e293b',
  card: '#334155',
  modal: '#475569',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  accent: '#06b6d4',
  accentLight: '#22d3ee',
  border: '#475569',
  borderLight: '#64748b',
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// Import screens that exist
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProductsScreen from '../screens/ProductsScreen';
import NewTransactionScreen from '../screens/NewTransactionScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Simple placeholder screens for missing components
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen: React.FC<{ title: string }> = ({ title }) => (
  <View style={placeholderStyles.container}>
    <Text style={placeholderStyles.text}>{title}</Text>
    <Text style={placeholderStyles.subtitle}>Coming Soon</Text>
  </View>
);

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
  },
});

// Placeholder components no longer needed

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator untuk main app
const MainTabNavigator: React.FC = () => {
  const { userRole } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Products':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
            case 'Transactions':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Reports':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return (
            <Ionicons 
              name={iconName as any}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerShown: false
        }}
      />

      <Tab.Screen 
        name="Products"
        component={ProductsScreen}
        options={{
          title: 'Produk'
        }}
      />

      <Tab.Screen 
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: 'Transaksi'
        }}
      />

      {userRole === 'admin' && (
        <Tab.Screen 
          name="Reports"
          component={ReportsScreen}
          options={{
            title: 'Laporan'
          }}
        />
      )}

      <Tab.Screen 
        name="Profile"
        component={SettingsScreen}
        options={{
          title: 'Profil'
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.surface,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        {user ? (
          <>
            <Stack.Screen 
              name="Main"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="NewTransaction"
              component={NewTransactionScreen}
              options={{
                title: 'Transaksi Baru',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="Settings"
              component={SettingsScreen}
              options={{
                title: 'Pengaturan',
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;