import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Product, Category } from '../types';

const Colors = {
  primary: '#1e3a8a',
  primaryDark: '#1e293b',
  background: '#0f172a',
  surface: '#1e293b',
  card: '#334155',
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

interface CartItem extends Product {
  quantity: number;
}

interface NewTransactionScreenProps {
  navigation: any;
}

const NewTransactionScreen: React.FC<NewTransactionScreenProps> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { products, categories, createTransaction } = useData();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qris'>('cash');
  const [customerPaid, setCustomerPaid] = useState<string>('');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const hasStock = product.stock > 0;
    return matchesSearch && matchesCategory && hasStock;
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateSubtotal = (): number => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = (): number => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = (): number => {
    return calculateSubtotal() + calculateTax();
  };

  const addToCart = (product: Product): void => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        Alert.alert('Stok Tidak Cukup', `Stok ${product.name} hanya ${product.stock} unit`);
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string): void => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number): void => {
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock) {
      Alert.alert('Stok Tidak Cukup', `Stok ${product.name} hanya ${product.stock} unit`);
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = (): void => {
    Alert.alert(
      'Hapus Semua Item',
      'Apakah Anda yakin ingin menghapus semua item dari keranjang?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: () => setCart([])
        }
      ]
    );
  };

  const processPayment = async (): Promise<void> => {
    if (cart.length === 0) {
      Alert.alert('Keranjang Kosong', 'Tambahkan produk ke keranjang terlebih dahulu');
      return;
    }

    const total = calculateTotal();
    const paid = parseFloat(customerPaid) || 0;

    if (paymentMethod === 'cash' && paid < total) {
      Alert.alert('Pembayaran Kurang', `Jumlah bayar minimal ${formatCurrency(total)}`);
      return;
    }

    try {
      const transactionData = {
        userId: userProfile?.uid || '',
        totalAmount: total,
        paymentMethod,
        notes: notes.trim() || undefined,
      };

      const result = await createTransaction(transactionData, cart);

      if (result.success) {
        Alert.alert(
          'Transaksi Berhasil',
          `Nomor Transaksi: ${result.transactionNumber}\nTotal: ${formatCurrency(total)}${paymentMethod === 'cash' ? `\nKembalian: ${formatCurrency(paid - total)}` : ''}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setCart([]);
                setCustomerPaid('');
                setNotes('');
                setIsPaymentModalVisible(false);
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Transaksi Gagal', result.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan yang tidak terduga');
    }
  };

  const renderProductCard = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => addToCart(product)}
    >
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="image" size={30} color={Colors.textMuted} />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
        <Text style={styles.productStock}>Stok: {product.stock}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCartItem = (item: CartItem) => (
    <View key={item.id} style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>{formatCurrency(item.price)}</Text>
      </View>
      <View style={styles.cartItemActions}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item.id)}
        >
          <Ionicons name="trash" size={16} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Transaksi Baru</Text>
        <TouchableOpacity onPress={clearCart} disabled={cart.length === 0}>
          <Ionicons 
            name="trash" 
            size={24} 
            color={cart.length > 0 ? Colors.error : Colors.textMuted} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari produk..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
          >
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === 'all' && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'all' && styles.categoryButtonTextActive
              ]}>
                Semua
              </Text>
            </TouchableOpacity>
            
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.productsGrid}>
            <View style={styles.productsContainer}>
              {filteredProducts.map(renderProductCard)}
            </View>
          </ScrollView>
        </View>

        {/* Cart Section */}
        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Keranjang ({cart.length})</Text>
            <Text style={styles.cartTotal}>{formatCurrency(calculateTotal())}</Text>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyCartText}>Keranjang kosong</Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.cartList}>
                {cart.map(renderCartItem)}
              </ScrollView>

              <View style={styles.cartSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(calculateSubtotal())}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Pajak (10%):</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(calculateTax())}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => setIsPaymentModalVisible(true)}
              >
                <Text style={styles.checkoutButtonText}>Bayar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Payment Modal */}
      <Modal
        visible={isPaymentModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsPaymentModalVisible(false)}
      >
        <View style={styles.paymentModal}>
          <View style={styles.paymentHeader}>
            <TouchableOpacity onPress={() => setIsPaymentModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.paymentTitle}>Pembayaran</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.paymentContent}>
            <View style={styles.paymentSection}>
              <Text style={styles.paymentSectionTitle}>Total Pembayaran</Text>
              <Text style={styles.paymentTotal}>{formatCurrency(calculateTotal())}</Text>
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.paymentSectionTitle}>Metode Pembayaran</Text>
              <View style={styles.paymentMethods}>
                {[
                  { key: 'cash', label: 'Tunai', icon: 'cash' },
                  { key: 'card', label: 'Kartu', icon: 'card' },
                  { key: 'qris', label: 'QRIS', icon: 'qr-code' }
                ].map((method) => (
                  <TouchableOpacity
                    key={method.key}
                    style={[
                      styles.paymentMethodButton,
                      paymentMethod === method.key && styles.paymentMethodButtonActive
                    ]}
                    onPress={() => setPaymentMethod(method.key as any)}
                  >
                    <Ionicons 
                      name={method.icon as any} 
                      size={20} 
                      color={paymentMethod === method.key ? Colors.white : Colors.text} 
                    />
                    <Text style={[
                      styles.paymentMethodText,
                      paymentMethod === method.key && styles.paymentMethodTextActive
                    ]}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {paymentMethod === 'cash' && (
              <View style={styles.paymentSection}>
                <Text style={styles.paymentSectionTitle}>Jumlah Dibayar</Text>
                <TextInput
                  style={styles.paymentInput}
                  placeholder="Masukkan jumlah yang dibayar..."
                  placeholderTextColor={Colors.textMuted}
                  value={customerPaid}
                  onChangeText={setCustomerPaid}
                  keyboardType="numeric"
                />
                {customerPaid && (
                  <Text style={styles.changeAmount}>
                    Kembalian: {formatCurrency(Math.max(0, parseFloat(customerPaid) - calculateTotal()))}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.paymentSection}>
              <Text style={styles.paymentSectionTitle}>Catatan (Opsional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Tambahkan catatan transaksi..."
                placeholderTextColor={Colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.processPaymentButton}
            onPress={processPayment}
          >
            <Text style={styles.processPaymentButtonText}>Proses Pembayaran</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  } as ViewStyle,
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  } as TextStyle,
  content: {
    flex: 1,
    flexDirection: 'row',
  } as ViewStyle,
  productsSection: {
    flex: 1,
    padding: 16,
  } as ViewStyle,
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  } as ViewStyle,
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  } as TextStyle,
  categoryFilter: {
    marginBottom: 16,
  } as ViewStyle,
  categoryButton: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  } as ViewStyle,
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  categoryButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  } as TextStyle,
  categoryButtonTextActive: {
    color: Colors.white,
  } as TextStyle,
  productsGrid: {
    flex: 1,
  } as ViewStyle,
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  } as ViewStyle,
  productCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  } as ViewStyle,
  productImage: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  } as ViewStyle,
  placeholderImage: {
    width: '100%',
    height: 80,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  productInfo: {
    padding: 12,
  } as ViewStyle,
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  } as TextStyle,
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.accent,
    marginBottom: 4,
  } as TextStyle,
  productStock: {
    fontSize: 12,
    color: Colors.textMuted,
  } as TextStyle,
  cartSection: {
    width: 320,
    backgroundColor: Colors.surface,
    padding: 16,
  } as ViewStyle,
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  } as TextStyle,
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.accent,
  } as TextStyle,
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  } as ViewStyle,
  emptyCartText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 8,
  } as TextStyle,
  cartList: {
    flex: 1,
    maxHeight: 300,
  } as ViewStyle,
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  } as ViewStyle,
  cartItemInfo: {
    flex: 1,
  } as ViewStyle,
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  } as TextStyle,
  cartItemPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
  } as TextStyle,
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  quantityButton: {
    backgroundColor: Colors.card,
    borderRadius: 4,
    padding: 4,
  } as ViewStyle,
  cartItemQuantity: {
    fontSize: 14,
    color: Colors.text,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  } as TextStyle,
  removeButton: {
    backgroundColor: Colors.error,
    borderRadius: 4,
    padding: 4,
    marginLeft: 8,
  } as ViewStyle,
  cartSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  } as ViewStyle,
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  } as ViewStyle,
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  } as TextStyle,
  summaryValue: {
    fontSize: 14,
    color: Colors.text,
  } as TextStyle,
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  } as ViewStyle,
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  } as TextStyle,
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.accent,
  } as TextStyle,
  checkoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  } as ViewStyle,
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  } as TextStyle,
  paymentModal: {
    flex: 1,
    backgroundColor: Colors.background,
  } as ViewStyle,
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  } as ViewStyle,
  paymentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  } as TextStyle,
  paymentContent: {
    flex: 1,
    padding: 20,
  } as ViewStyle,
  paymentSection: {
    marginBottom: 24,
  } as ViewStyle,
  paymentSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  } as TextStyle,
  paymentTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.accent,
  } as TextStyle,
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  } as ViewStyle,
  paymentMethodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  } as ViewStyle,
  paymentMethodButtonActive: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  paymentMethodText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  } as TextStyle,
  paymentMethodTextActive: {
    color: Colors.white,
  } as TextStyle,
  paymentInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  } as TextStyle,
  changeAmount: {
    fontSize: 14,
    color: Colors.success,
    marginTop: 8,
    textAlign: 'right',
  } as TextStyle,
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
  } as TextStyle,
  processPaymentButton: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  } as ViewStyle,
  processPaymentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  } as TextStyle,
});

export default NewTransactionScreen; 