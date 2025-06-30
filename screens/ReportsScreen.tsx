import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const Colors = {
  primary: '#1e3a8a',
  primaryDark: '#1e293b',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  accent: '#06b6d4',
  border: '#475569',
  white: '#ffffff',
};

interface ReportData {
  totalRevenue: number;
  totalTransactions: number;
  totalProducts: number;
  topProducts: any[];
}

const ReportsScreen: React.FC = () => {
  const { userRole } = useAuth();
  const { getDashboardMetrics } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('today');
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalTransactions: 0,
    totalProducts: 0,
    topProducts: []
  });

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = (): void => {
    const data = getDashboardMetrics();
    setReportData({
      totalRevenue: data.totalRevenue,
      totalTransactions: data.totalTransactions,
      totalProducts: data.totalProducts,
      topProducts: []
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const periods = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'week', label: '7 Hari' },
    { key: 'month', label: '30 Hari' },
    { key: 'year', label: 'Tahun Ini' }
  ];

  if (userRole !== 'admin') {
    return (
      <View style={styles.restrictedContainer}>
        <Ionicons name="lock-closed" size={60} color={Colors.textMuted} />
        <Text style={styles.restrictedTitle}>Akses Terbatas</Text>
        <Text style={styles.restrictedText}>
          Fitur laporan hanya tersedia untuk Administrator
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Laporan Penjualan</Text>
        <Text style={styles.subtitle}>Dashboard analisis bisnis</Text>
      </View>

      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextActive
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Ionicons name="cash" size={24} color={Colors.success} />
          <Text style={styles.metricValue}>{formatCurrency(reportData.totalRevenue)}</Text>
          <Text style={styles.metricLabel}>Total Pendapatan</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="receipt" size={24} color={Colors.primary} />
          <Text style={styles.metricValue}>{reportData.totalTransactions}</Text>
          <Text style={styles.metricLabel}>Total Transaksi</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="cube" size={24} color={Colors.accent} />
          <Text style={styles.metricValue}>{reportData.totalProducts}</Text>
          <Text style={styles.metricLabel}>Produk Terjual</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="trending-up" size={24} color={Colors.warning} />
          <Text style={styles.metricValue}>
            {reportData.totalTransactions > 0 ? formatCurrency(reportData.totalRevenue / reportData.totalTransactions) : 'Rp 0'}
          </Text>
          <Text style={styles.metricLabel}>Rata-rata per Transaksi</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fitur Laporan Lainnya</Text>
        
        <TouchableOpacity style={styles.featureButton}>
          <Ionicons name="bar-chart" size={24} color={Colors.accent} />
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Laporan Penjualan Detail</Text>
            <Text style={styles.featureDescription}>Analisis penjualan per produk dan kategori</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureButton}>
          <Ionicons name="cube" size={24} color={Colors.warning} />
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Laporan Inventaris</Text>
            <Text style={styles.featureDescription}>Status stok dan pergerakan produk</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureButton}>
          <Ionicons name="card" size={24} color={Colors.success} />
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Laporan Keuangan</Text>
            <Text style={styles.featureDescription}>Analisis pendapatan dan keuntungan</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  } as ViewStyle,
  restrictedContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  } as ViewStyle,
  restrictedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  } as TextStyle,
  restrictedText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  } as TextStyle,
  header: {
    padding: 20,
    paddingTop: 60,
  } as ViewStyle,
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  } as TextStyle,
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  } as TextStyle,
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  } as ViewStyle,
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  } as ViewStyle,
  periodButtonActive: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  periodButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  } as TextStyle,
  periodButtonTextActive: {
    color: Colors.white,
  } as TextStyle,
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 30,
  } as ViewStyle,
  metricCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginRight: '2%',
    marginBottom: 16,
    alignItems: 'center',
  } as ViewStyle,
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginVertical: 8,
    textAlign: 'center',
  } as TextStyle,
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  } as TextStyle,
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  } as TextStyle,
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  } as ViewStyle,
  featureContent: {
    flex: 1,
    marginLeft: 12,
  } as ViewStyle,
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  } as TextStyle,
  featureDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  } as TextStyle,
});

export default ReportsScreen; 