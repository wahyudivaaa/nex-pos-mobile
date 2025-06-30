import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import AppNavigator from '../navigation/AppNavigator';

export default function RootLayout() {
  return (
    <AuthProvider>
      <DataProvider>
        <StatusBar style="light" backgroundColor="#0f172a" />
        <AppNavigator />
      </DataProvider>
    </AuthProvider>
  );
}
