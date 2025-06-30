import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Modal,
    ScrollView,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ScreenNavigationProp, Transaction } from '../types';
import Button from '../components/ui/Button';

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

interface TransactionsScreenProps {
    navigation: ScreenNavigationProp;
}

const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ navigation }) => {
    const { transactions, getTransactionDetails } = useData();
    const { userRole, userProfile } = useAuth();
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
    const [transactionDetails, setTransactionDetails] = useState<any[]>([]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: any): string => {
        const dateObj = date && date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filterTransactionsByPeriod = (): Transaction[] => {
        const now = new Date();
        let filteredTransactions = transactions;

        // Filter berdasarkan user role
        if (userRole === 'kasir') {
            filteredTransactions = transactions.filter(
                transaction => transaction.userId === userProfile?.uid
            );
        }

        // Filter berdasarkan periode
        if (selectedPeriod !== 'all') {
            const periodDays: { [key: string]: number } = {
                'today': 1,
                'week': 7,
                'month': 30,
            };

            const days = periodDays[selectedPeriod];
            const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

            filteredTransactions = filteredTransactions.filter(transaction => {
                const transactionDate = transaction.createdAt && (transaction.createdAt as any).toDate ?
                    (transaction.createdAt as any).toDate() : new Date(transaction.createdAt);
                return transactionDate >= startDate;
            });
        }

        return filteredTransactions.sort((a, b) => {
            const dateA = a.createdAt && (a.createdAt as any).toDate ? 
                (a.createdAt as any).toDate() : new Date(a.createdAt);
            const dateB = b.createdAt && (b.createdAt as any).toDate ? 
                (b.createdAt as any).toDate() : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });
    };

    const generateReceipt = async (transaction: Transaction): Promise<void> => {
        try {
            const details = await getTransactionDetails(transaction.id);

            if (!details.success) {
                Alert.alert('Error', 'Gagal mengambil detail transaksi');
                return;
            }

            const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .title { font-size: 18px; font-weight: bold; }
            .subtitle { font-size: 12px; color: #666; }
            .transaction-info { margin: 15px 0; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .items { margin: 15px 0; }
            .item { display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px; }
            .total { border-top: 1px solid #000; padding-top: 10px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">NexPOS</div>
            <div class="subtitle">Sistem Point of Sale Modern</div>
          </div>
          
          <div class="transaction-info">
            <div class="row">
              <span>No. Transaksi:</span>
              <span>${transaction.transactionNumber || transaction.id}</span>
            </div>
            <div class="row">
              <span>Tanggal:</span>
              <span>${formatDate(transaction.createdAt)}</span>
            </div>
            <div class="row">
              <span>Kasir:</span>
              <span>${userProfile?.name || 'Unknown'}</span>
            </div>
            <div class="row">
              <span>Pembayaran:</span>
              <span>${transaction.paymentMethod?.toUpperCase() || 'CASH'}</span>
            </div>
          </div>

          <div class="items">
            ${details.details?.map((item: any) => `
              <div class="item">
                <span>${item.productName} x${item.quantity}</span>
                <span>${formatCurrency(item.subtotal)}</span>
              </div>
            `).join('')}
          </div>

          <div class="total">
            <div class="row">
              <span>Total:</span>
              <span>${formatCurrency(transaction.totalAmount)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri);

    } catch (error) {
      Alert.alert('Error', 'Gagal membuat struk transaksi');
    }
  };

      const onRefresh = async (): Promise<void> => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const showTransactionDetail = async (transaction: Transaction): Promise<void> => {
        setSelectedTransaction(transaction);
        const details = await getTransactionDetails(transaction.id);
        if (details.success) {
            setTransactionDetails(details.details || []);
        } else {
            setTransactionDetails([]);
        }
        setIsDetailModalVisible(true);
    };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const getStatusColor = (): string => {
      switch (item.status) {
        case 'completed': return Colors.success;
        case 'pending': return Colors.warning;
        case 'cancelled': return Colors.error;
        default: return Colors.textMuted;
      }
    };

    const getPaymentMethodIcon = (): string => {
      switch (item.paymentMethod) {
        case 'cash': return 'cash';
        case 'card': return 'card';
        case 'qris': return 'qr-code';
        default: return 'wallet';
      }
    };

    return (
      <TouchableOpacity 
        style={styles.transactionCard}
        onPress={() => showTransactionDetail(item)}
      >
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionNumber}>
              {item.transactionNumber || item.id.substring(0, 8)}
            </Text>
            <Text style={styles.transactionDate}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          
          <View style={styles.transactionMeta}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>
                {item.status === 'completed' ? 'Selesai' : 
                 item.status === 'pending' ? 'Pending' : 'Dibatalkan'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.transactionBody}>
          <View style={styles.amountContainer}>
            <Text style={styles.transactionAmount}>
              {formatCurrency(item.totalAmount)}
            </Text>
            
            <View style={styles.paymentMethod}>
              <Ionicons 
                name={getPaymentMethodIcon() as any} 
                size={16} 
                color={Colors.textMuted} 
              />
              <Text style={styles.paymentMethodText}>
                {item.paymentMethod?.toUpperCase() || 'CASH'}
              </Text>
            </View>
          </View>

          <View style={styles.transactionActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => generateReceipt(item)}
            >
              <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => showTransactionDetail(item)}
            >
              <Ionicons name="eye-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredTransactions = filterTransactionsByPeriod();

  return (
    <View style={styles.container}>
      {/* Header with New Transaction Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {userRole === 'admin' ? 'Semua Transaksi' : 'Transaksi Saya'}
        </Text>
        <Button
          title="Transaksi Baru"
          onPress={() => navigation.navigate('NewTransaction')}
          size="small"
          icon={<Ionicons name="add" size={16} color={Colors.white} />}
        />
      </View>

      {/* Period Filter */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'Semua' },
          { key: 'today', label: 'Hari Ini' },
          { key: 'week', label: '7 Hari' },
          { key: 'month', label: '30 Hari' },
        ].map(period => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.filterButton,
              selectedPeriod === period.key && styles.activeFilterButton
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedPeriod === period.key && styles.activeFilterButtonText
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Statistics */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Transaksi</Text>
          <Text style={styles.summaryValue}>{filteredTransactions.length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Pendapatan</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(
              filteredTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0)
            )}
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        style={styles.transactionsList}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyStateText}>Belum ada transaksi</Text>
          </View>
        }
      />

      {/* Transaction Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsDetailModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detail Transaksi</Text>
            <TouchableOpacity
              onPress={() => selectedTransaction && generateReceipt(selectedTransaction)}
            >
              <Ionicons name="share-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {selectedTransaction && (
            <ScrollView style={styles.modalContent}>
              {/* Transaction Header */}
              <View style={styles.detailHeader}>
                <Text style={styles.detailTransactionNumber}>
                  #{selectedTransaction.transactionNumber || selectedTransaction.id.substring(0, 8)}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: selectedTransaction.status === 'completed' ? Colors.success : 
                                   selectedTransaction.status === 'pending' ? Colors.warning : Colors.error }
                ]}>
                  <Text style={styles.statusText}>
                    {selectedTransaction.status === 'completed' ? 'Selesai' : 
                     selectedTransaction.status === 'pending' ? 'Pending' : 'Dibatalkan'}
                  </Text>
                </View>
              </View>

              {/* Transaction Info */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tanggal & Waktu:</Text>
                  <Text style={styles.infoValue}>{formatDate(selectedTransaction.createdAt)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Metode Pembayaran:</Text>
                  <View style={styles.paymentMethodContainer}>
                    <Ionicons 
                      name={selectedTransaction.paymentMethod === 'cash' ? 'cash' : 
                           selectedTransaction.paymentMethod === 'qris' ? 'qr-code' : 'card'} 
                      size={16} 
                      color={Colors.accent} 
                    />
                    <Text style={styles.infoValue}>
                      {selectedTransaction.paymentMethod?.toUpperCase() || 'CASH'}
                    </Text>
                  </View>
                </View>
                {selectedTransaction.notes && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Catatan:</Text>
                    <Text style={styles.infoValue}>{selectedTransaction.notes}</Text>
                  </View>
                )}
              </View>

              {/* Items List */}
              <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>Item Transaksi</Text>
                {transactionDetails.map((item: any, index: number) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.productName}</Text>
                      <Text style={styles.itemDetails}>
                        {formatCurrency(item.unitPrice)} x {item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>
                      {formatCurrency(item.subtotal)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Total Section */}
              <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Pembayaran:</Text>
                  <Text style={styles.totalAmount}>
                    {formatCurrency(selectedTransaction.totalAmount)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionSection}>
                <Button
                  title="Cetak Ulang Struk"
                  onPress={() => generateReceipt(selectedTransaction)}
                  style={styles.printButton}
                  icon={<Ionicons name="print" size={20} color={Colors.white} />}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  } as ViewStyle,
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  } as TextStyle,
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  } as ViewStyle,
  filterButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  } as ViewStyle,
  activeFilterButton: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  filterButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
  } as TextStyle,
  activeFilterButtonText: {
    color: Colors.white,
    fontWeight: '600',
  } as TextStyle,
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  } as ViewStyle,
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  } as ViewStyle,
  summaryLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  } as TextStyle,
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.accent,
  } as TextStyle,
  transactionsList: {
    flex: 1,
    paddingHorizontal: 16,
  } as ViewStyle,
  scrollContent: {
    paddingBottom: 100, // Space for tab bar
  } as ViewStyle,
  transactionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  } as ViewStyle,
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  } as ViewStyle,
  transactionInfo: {
    flex: 1,
  } as ViewStyle,
  transactionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  } as TextStyle,
  transactionDate: {
    fontSize: 12,
    color: Colors.textMuted,
  } as TextStyle,
  transactionMeta: {
    alignItems: 'flex-end',
  } as ViewStyle,
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  } as ViewStyle,
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  } as TextStyle,
  transactionBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  amountContainer: {
    flex: 1,
  } as ViewStyle,
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
    marginBottom: 4,
  } as TextStyle,
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  paymentMethodText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 4,
  } as TextStyle,
  transactionActions: {
    flexDirection: 'row',
  } as ViewStyle,
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  } as ViewStyle,
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  } as ViewStyle,
  emptyStateText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 8,
  } as TextStyle,
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  } as ViewStyle,
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  } as TextStyle,
  modalContent: {
    flex: 1,
    padding: 20,
  } as ViewStyle,
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  } as ViewStyle,
  detailTransactionNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  } as TextStyle,
  infoSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  } as ViewStyle,
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  } as ViewStyle,
  infoLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  } as TextStyle,
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  } as TextStyle,
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  itemsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  } as TextStyle,
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  } as ViewStyle,
  itemInfo: {
    flex: 1,
  } as ViewStyle,
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  } as TextStyle,
  itemDetails: {
    fontSize: 12,
    color: Colors.textMuted,
  } as TextStyle,
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.accent,
  } as TextStyle,
  totalSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  } as ViewStyle,
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  } as TextStyle,
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.success,
  } as TextStyle,
  actionSection: {
    marginBottom: 20,
  } as ViewStyle,
  printButton: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
});

export default TransactionsScreen;