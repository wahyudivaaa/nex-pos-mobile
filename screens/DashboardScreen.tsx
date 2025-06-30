import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ScreenNavigationProp } from '../types';

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

interface DashboardData {
    totalRevenue: number;
    totalTransactions: number;
    totalProducts: number;
    lowStockProducts: any[];
    recentTransactions: any[];
    todayRevenue: number;
    todayTransactions: number;
    topProducts: any[];
    salesGrowth: number;
}

interface DashboardScreenProps {
    navigation: ScreenNavigationProp;
}

interface MetricCardProps {
    title: string;
    value: string;
    icon: string;
    color: string;
    onPress: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
    const { userProfile, userRole } = useAuth();
    const { getDashboardMetrics } = useData();
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        totalRevenue: 0,
        totalTransactions: 0,
        totalProducts: 0,
        lowStockProducts: [],
        recentTransactions: [],
        todayRevenue: 0,
        todayTransactions: 0,
        topProducts: [],
        salesGrowth: 0
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = (): void => {
        const data = getDashboardMetrics();
        
        // Mock data untuk demonstration - dalam production akan diambil dari database
        const mockTopProducts = [
            { name: 'Ayam Goreng', sold: 63, revenue: 945000 },
            { name: 'Nasi Goreng', sold: 45, revenue: 675000 },
            { name: 'Mie Goreng', sold: 38, revenue: 570000 }
        ];
        
        const mockRecentTransactions = [
            { id: '1', amount: 45000, time: '2 menit lalu', method: 'cash' },
            { id: '2', amount: 78000, time: '5 menit lalu', method: 'qris' },
            { id: '3', amount: 156000, time: '8 menit lalu', method: 'card' }
        ];

        setDashboardData({
            totalRevenue: data.totalRevenue,
            totalTransactions: data.totalTransactions,
            totalProducts: data.totalProducts,
            lowStockProducts: [],
            recentTransactions: mockRecentTransactions,
            todayRevenue: Math.floor(data.totalRevenue * 0.3),
            todayTransactions: Math.floor(data.totalTransactions * 0.15),
            topProducts: mockTopProducts,
            salesGrowth: 15.2
        });
    };

    const onRefresh = async (): Promise<void> => {
        setRefreshing(true);
        loadDashboardData();
        setRefreshing(false);
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, onPress }) => (
        <TouchableOpacity style={styles.metricCard} onPress={onPress}>
            <LinearGradient
                colors={[color, color + 'CC']}
                style={styles.metricGradient}
            >
                <View style={styles.metricHeader}>
                    <Ionicons 
                        name={icon as any} 
                        size={24} 
                        color={Colors.white} 
                    />
                </View>
                <Text style={styles.metricValue}>{value}</Text>
                <Text style={styles.metricTitle}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh} 
                />
            }
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>
                        Selamat datang, {userProfile?.name || 'User'}!
                    </Text>
                    <Text style={styles.role}>
                        {userRole === 'admin' ? 'Administrator' : 'Kasir'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Ionicons 
                        name="person-circle" 
                        size={40} 
                        color={Colors.accent} 
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.metricsContainer}>
                <MetricCard
                    title="Total Pendapatan"
                    value={formatCurrency(dashboardData.totalRevenue)}
                    icon="cash"
                    color={Colors.success}
                    onPress={() => navigation.navigate('Reports')}
                />
                <MetricCard
                    title="Transaksi"
                    value={dashboardData.totalTransactions.toString()}
                    icon="receipt"
                    color={Colors.primary}
                    onPress={() => navigation.navigate('Transactions')}
                />
                <MetricCard
                    title="Produk"
                    value={dashboardData.totalProducts.toString()}
                    icon="cube"
                    color={Colors.accent}
                    onPress={() => navigation.navigate('Products')}
                />
                <MetricCard
                    title="Stok Menipis"
                    value={dashboardData.lowStockProducts.length.toString()}
                    icon="warning"
                    color={Colors.warning}
                    onPress={() => navigation.navigate('Products')}
                />
            </View>

            {/* Today vs Total Stats */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Statistik Hari Ini</Text>
                <View style={styles.todayStatsContainer}>
                    <View style={styles.todayStatCard}>
                        <Text style={styles.todayStatLabel}>Pendapatan Hari Ini</Text>
                        <Text style={styles.todayStatValue}>
                            {formatCurrency(dashboardData.todayRevenue)}
                        </Text>
                        <View style={styles.growthContainer}>
                            <Ionicons name="trending-up" size={16} color={Colors.success} />
                            <Text style={styles.growthText}>+{dashboardData.salesGrowth}%</Text>
                        </View>
                    </View>
                    <View style={styles.todayStatCard}>
                        <Text style={styles.todayStatLabel}>Transaksi Hari Ini</Text>
                        <Text style={styles.todayStatValue}>
                            {dashboardData.todayTransactions}
                        </Text>
                        <Text style={styles.todayStatSubtext}>
                            dari {dashboardData.totalTransactions} total
                        </Text>
                    </View>
                </View>
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transaksi Terbaru</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                        <Text style={styles.seeAllText}>Lihat Semua</Text>
                    </TouchableOpacity>
                </View>
                {dashboardData.recentTransactions.map((transaction: any) => (
                    <View key={transaction.id} style={styles.transactionItem}>
                        <View style={styles.transactionInfo}>
                            <Text style={styles.transactionAmount}>
                                {formatCurrency(transaction.amount)}
                            </Text>
                            <Text style={styles.transactionTime}>{transaction.time}</Text>
                        </View>
                        <View style={styles.paymentMethodBadge}>
                            <Ionicons 
                                name={transaction.method === 'cash' ? 'cash' : 
                                     transaction.method === 'qris' ? 'qr-code' : 'card'} 
                                size={16} 
                                color={Colors.accent} 
                            />
                            <Text style={styles.paymentMethodText}>
                                {transaction.method.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Top Products */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Produk Terlaris</Text>
                {dashboardData.topProducts.map((product: any, index: number) => (
                    <View key={index} style={styles.topProductItem}>
                        <View style={styles.productRank}>
                            <Text style={styles.rankNumber}>#{index + 1}</Text>
                        </View>
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productStats}>
                                {product.sold} terjual • {formatCurrency(product.revenue)}
                            </Text>
                        </View>
                        <View style={styles.productProgress}>
                            <View 
                                style={[
                                    styles.progressBar, 
                                    { width: `${Math.min((product.sold / 70) * 100, 100)}%` }
                                ]} 
                            />
                        </View>
                    </View>
                ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Aksi Cepat</Text>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity
                        style={[styles.quickActionButton, { backgroundColor: Colors.primary }]}
                        onPress={() => navigation.navigate('NewTransaction')}
                    >
                        <Ionicons name="add-circle" size={24} color={Colors.white} />
                        <Text style={styles.quickActionText}>Transaksi Baru</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.quickActionButton, { backgroundColor: Colors.accent }]}
                        onPress={() => navigation.navigate('Products')}
                    >
                        <Ionicons name="cube" size={24} color={Colors.white} />
                        <Text style={styles.quickActionText}>Kelola Produk</Text>
                    </TouchableOpacity>
                    
                    {userRole === 'admin' && (
                        <TouchableOpacity
                            style={[styles.quickActionButton, { backgroundColor: Colors.success }]}
                            onPress={() => navigation.navigate('Reports')}
                        >
                            <Ionicons name="bar-chart" size={24} color={Colors.white} />
                            <Text style={styles.quickActionText}>Laporan</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    } as ViewStyle,
    scrollContent: {
        paddingBottom: 100, // Space for tab bar
    } as ViewStyle,
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
    } as ViewStyle,
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
    } as TextStyle,
    role: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    } as TextStyle,
    profileButton: {
        padding: 4,
    } as ViewStyle,
    metricsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    } as ViewStyle,
    metricCard: {
        width: '48%',
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    } as ViewStyle,
    metricGradient: {
        padding: 16,
        minHeight: 100,
        justifyContent: 'space-between',
    } as ViewStyle,
    metricHeader: {
        alignSelf: 'flex-end',
    } as ViewStyle,
    metricValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.white,
        marginTop: 8,
    } as TextStyle,
    metricTitle: {
        fontSize: 12,
        color: Colors.white,
        opacity: 0.9,
        marginTop: 4,
    } as TextStyle,
    section: {
        marginHorizontal: 20,
        marginBottom: 24,
    } as ViewStyle,
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
    } as TextStyle,
      quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flex: 1,
    marginHorizontal: 4,
  } as ViewStyle,
  quickActionText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  } as TextStyle,
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  } as ViewStyle,
  todayStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,
  todayStatCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
  } as ViewStyle,
  todayStatLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  } as TextStyle,
  todayStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  } as TextStyle,
  todayStatSubtext: {
    fontSize: 10,
    color: Colors.textMuted,
  } as TextStyle,
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  growthText: {
    fontSize: 12,
    color: Colors.success,
    marginLeft: 4,
    fontWeight: '600',
  } as TextStyle,
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,
  seeAllText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  } as TextStyle,
  transactionItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  transactionInfo: {
    flex: 1,
  } as ViewStyle,
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  } as TextStyle,
  transactionTime: {
    fontSize: 12,
    color: Colors.textMuted,
  } as TextStyle,
  paymentMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  } as ViewStyle,
  paymentMethodText: {
    fontSize: 10,
    color: Colors.accent,
    marginLeft: 4,
    fontWeight: '600',
  } as TextStyle,
  topProductItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
  } as TextStyle,
  productInfo: {
    flex: 1,
    marginRight: 12,
  } as ViewStyle,
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  } as TextStyle,
  productStats: {
    fontSize: 12,
    color: Colors.textMuted,
  } as TextStyle,
  productProgress: {
    width: 60,
    height: 4,
    backgroundColor: Colors.card,
    borderRadius: 2,
    overflow: 'hidden',
  } as ViewStyle,
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  } as ViewStyle,
});

export default DashboardScreen;