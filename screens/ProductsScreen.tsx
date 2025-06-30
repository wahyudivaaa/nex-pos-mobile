import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Alert,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';
import { Product, Category } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const { width } = Dimensions.get('window');

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  alertStock: string;
  categoryId: string;
  imageUrl: string;
  barcode?: string;
}

interface SortOption {
  key: string;
  label: string;
  icon: string;
}

interface FilterOptions {
  priceRange: { min: string; max: string };
  stockStatus: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
  sortBy: 'name' | 'price' | 'stock' | 'created' | 'updated';
  sortOrder: 'asc' | 'desc';
}

const ProductsScreen: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  const [isStockModalVisible, setIsStockModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<{ type: 'add' | 'remove'; amount: string; reason: string }>({
    type: 'add',
    amount: '',
    reason: ''
  });

  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: '', max: '' },
    stockStatus: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    alertStock: '5',
    categoryId: '',
    imageUrl: '',
    barcode: ''
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const userRole = user?.role || 'kasir';

  const sortOptions: SortOption[] = [
    { key: 'name', label: 'Nama', icon: 'text-outline' },
    { key: 'price', label: 'Harga', icon: 'cash-outline' },
    { key: 'stock', label: 'Stok', icon: 'cube-outline' },
    { key: 'created', label: 'Terbaru', icon: 'time-outline' },
  ];

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Nama produk wajib diisi';
    } else if (formData.name.length < 3) {
      errors.name = 'Nama produk minimal 3 karakter';
    }

    if (!formData.price.trim()) {
      errors.price = 'Harga wajib diisi';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = 'Harga harus berupa angka positif';
    }

    if (!formData.stock.trim()) {
      errors.stock = 'Stok wajib diisi';
    } else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      errors.stock = 'Stok harus berupa angka non-negatif';
    }

    if (formData.alertStock && (isNaN(Number(formData.alertStock)) || Number(formData.alertStock) < 0)) {
      errors.alertStock = 'Alert stok harus berupa angka non-negatif';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Kategori wajib dipilih';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      // Data will auto-refresh via Firebase listeners
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const resetForm = (): void => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      alertStock: '5',
      categoryId: '',
      imageUrl: '',
      barcode: ''
    });
    setFormErrors({});
    setEditingProduct(null);
  };

  const handleAddProduct = (): void => {
    resetForm();
    setIsModalVisible(true);
  };

  const handleEditProduct = (product: Product): void => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      alertStock: product.alertStock?.toString() || '5',
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || '',
      barcode: product.barcode || ''
    });
    setEditingProduct(product);
    setIsModalVisible(true);
  };

  const handleDeleteProduct = (product: Product): void => {
    if (userRole !== 'admin') return;

    Alert.alert(
      'Hapus Produk',
      `Apakah Anda yakin ingin menghapus "${product.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              Alert.alert('Berhasil', 'Produk berhasil dihapus');
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus produk');
            }
          },
        },
      ]
    );
  };

  const handleBulkDelete = (): void => {
    if (selectedProducts.size === 0 || userRole !== 'admin') return;

    Alert.alert(
      'Hapus Produk',
      `Apakah Anda yakin ingin menghapus ${selectedProducts.size} produk yang dipilih?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              for (const productId of selectedProducts) {
                await deleteProduct(productId);
              }
              setSelectedProducts(new Set());
              setIsSelectionMode(false);
              Alert.alert('Berhasil', 'Produk berhasil dihapus');
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus beberapa produk');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleImagePicker = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, imageUrl: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih gambar');
    }
  };

  const handleStockAdjustment = async (): Promise<void> => {
    if (!stockAdjustProduct || !stockAdjustment.amount || !stockAdjustment.reason) {
      Alert.alert('Error', 'Harap isi semua field');
      return;
    }

    const amount = parseInt(stockAdjustment.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Jumlah harus berupa angka positif');
      return;
    }

    try {
      setIsSubmitting(true);
      const newStock = stockAdjustment.type === 'add' 
        ? stockAdjustProduct.stock + amount
        : Math.max(0, stockAdjustProduct.stock - amount);

      await updateProduct(stockAdjustProduct.id, {
        ...stockAdjustProduct,
        stock: newStock
      });

      setIsStockModalVisible(false);
      setStockAdjustProduct(null);
      setStockAdjustment({ type: 'add', amount: '', reason: '' });
      Alert.alert('Berhasil', 'Stok berhasil diperbarui');
    } catch (error) {
      Alert.alert('Error', 'Gagal memperbarui stok');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      Alert.alert('Validasi Error', 'Harap perbaiki field yang bermasalah');
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        alertStock: parseInt(formData.alertStock) || 5,
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl,
        barcode: formData.barcode?.trim() || undefined,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        Alert.alert('Berhasil', 'Produk berhasil diperbarui');
      } else {
        await addProduct(productData);
        Alert.alert('Berhasil', 'Produk berhasil ditambahkan');
      }

      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportProducts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Create CSV data
      const csvHeader = 'Nama,Deskripsi,Harga,Stok,Alert Stok,Kategori,Barcode\n';
      const csvData = filteredProducts.map(product => {
        const category = categories.find(cat => cat.id === product.categoryId)?.name || '';
        return `"${product.name}","${product.description || ''}","${product.price}","${product.stock}","${product.alertStock || 5}","${category}","${product.barcode || ''}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvData;
      
      // For this demo, we'll just show an alert
      // In a real app, you'd save to file system and share
      Alert.alert(
        'Export Berhasil',
        `Data ${filteredProducts.length} produk siap untuk export.\n\nDalam implementasi real, file CSV akan disimpan dan dibagikan.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal export data produk');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredAndSortedProducts = (): Product[] => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.includes(searchQuery)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Price range filter
    if (filters.priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseFloat(filters.priceRange.min));
    }
    if (filters.priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseFloat(filters.priceRange.max));
    }

    // Stock status filter
    switch (filters.stockStatus) {
      case 'inStock':
        filtered = filtered.filter(product => product.stock > (product.alertStock || 5));
        break;
      case 'lowStock':
        filtered = filtered.filter(product => product.stock <= (product.alertStock || 5) && product.stock > 0);
        break;
      case 'outOfStock':
        filtered = filtered.filter(product => product.stock === 0);
        break;
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'created':
          aValue = a.createdAt || new Date();
          bValue = b.createdAt || new Date();
          break;
        case 'updated':
          aValue = a.updatedAt || new Date();
          bValue = b.updatedAt || new Date();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  const toggleProductSelection = (productId: string): void => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const selectAllProducts = (): void => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const renderProductCard = ({ item: product }: { item: Product }) => {
    const category = categories.find(cat => cat.id === product.categoryId);
    const isLowStock = product.stock <= (product.alertStock || 5);
    const isSelected = selectedProducts.has(product.id);

    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          isSelected && styles.productCardSelected
        ]}
        onPress={() => {
          if (isSelectionMode) {
            toggleProductSelection(product.id);
          }
        }}
        onLongPress={() => {
          if (userRole === 'admin') {
            setIsSelectionMode(true);
            toggleProductSelection(product.id);
          }
        }}
      >
        <View style={styles.productImageContainer}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={40} color={Colors.textMuted} />
            </View>
          )}
          
          {isLowStock && product.stock > 0 && (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>Stok Menipis</Text>
            </View>
          )}

          {product.stock === 0 && (
            <View style={[styles.lowStockBadge, { backgroundColor: Colors.error }]}>
              <Text style={styles.lowStockText}>Habis</Text>
            </View>
          )}

          {isSelectionMode && (
            <View style={styles.selectionCheckbox}>
              <Ionicons 
                name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color={isSelected ? Colors.primary : Colors.white} 
              />
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
          
          <View style={styles.productMeta}>
            <Text style={styles.productStock}>Stok: {product.stock}</Text>
            <Text style={styles.productCategory}>{category?.name || 'Tanpa Kategori'}</Text>
          </View>

          {product.barcode && (
            <Text style={styles.productBarcode}>Barcode: {product.barcode}</Text>
          )}
        </View>

        {userRole === 'admin' && !isSelectionMode && (
          <View style={styles.productActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setStockAdjustProduct(product);
                setIsStockModalVisible(true);
              }}
            >
              <Ionicons name="cube" size={16} color={Colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditProduct(product)}
            >
              <Ionicons name="pencil" size={16} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteProduct(product)}
            >
              <Ionicons name="trash" size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Produk</Text>
            <Text style={styles.subtitle}>
              {isSelectionMode 
                ? `${selectedProducts.size} dipilih dari ${filteredProducts.length} produk`
                : `${filteredProducts.length} produk tersedia`
              }
            </Text>
          </View>
          
          {userRole === 'admin' && (
            <View style={styles.headerActions}>
              {isSelectionMode ? (
                <>
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={selectAllProducts}
                  >
                    <Ionicons name="checkmark-done" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={handleBulkDelete}
                    disabled={selectedProducts.size === 0}
                  >
                    <Ionicons 
                      name="trash" 
                      size={20} 
                      color={selectedProducts.size > 0 ? Colors.error : Colors.textMuted} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={() => {
                      setIsSelectionMode(false);
                      setSelectedProducts(new Set());
                    }}
                  >
                    <Ionicons name="close" size={20} color={Colors.text} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={handleExportProducts}
                  >
                    <Ionicons name="download-outline" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={() => setIsFilterModalVisible(true)}
                  >
                    <Ionicons name="filter-outline" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari produk atau barcode..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        
        {userRole === 'admin' && !isSelectionMode && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
            <Ionicons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
        )}
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
            Semua ({products.length})
          </Text>
        </TouchableOpacity>
        
        {categories.map((category) => {
          const count = products.filter(p => p.categoryId === category.id).length;
          return (
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
                {category.name} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memproses...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={80} color={Colors.textMuted} />
          <Text style={styles.emptyStateTitle}>
            {searchQuery || selectedCategory !== 'all' || filters.stockStatus !== 'all' 
              ? 'Produk Tidak Ditemukan' 
              : 'Belum Ada Produk'
            }
          </Text>
          <Text style={styles.emptyStateText}>
            {searchQuery || selectedCategory !== 'all' || filters.stockStatus !== 'all'
              ? 'Coba ubah filter pencarian'
              : userRole === 'admin' 
                ? 'Tambahkan produk pertama Anda'
                : 'Belum ada produk yang tersedia'
            }
          </Text>
          {userRole === 'admin' && !searchQuery && selectedCategory === 'all' && (
            <Button
              title="Tambah Produk"
              onPress={handleAddProduct}
              style={styles.emptyStateButton}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.scrollContent}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Product Form Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => !isSubmitting && setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => !isSubmitting && setIsModalVisible(false)}
              disabled={isSubmitting}
            >
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Input
              label="Nama Produk *"
              value={formData.name}
              onChangeText={(text) => {
                setFormData({ ...formData, name: text });
                if (formErrors.name) {
                  setFormErrors({ ...formErrors, name: '' });
                }
              }}
              placeholder="Masukkan nama produk"
              error={formErrors.name}
            />

            <Input
              label="Deskripsi"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Masukkan deskripsi produk"
              multiline
              numberOfLines={3}
            />

            <View style={styles.formRow}>
              <View style={styles.halfInput}>
                <Input
                  label="Harga *"
                  value={formData.price}
                  onChangeText={(text) => {
                    setFormData({ ...formData, price: text.replace(/[^0-9.]/g, '') });
                    if (formErrors.price) {
                      setFormErrors({ ...formErrors, price: '' });
                    }
                  }}
                  placeholder="0"
                  keyboardType="numeric"
                  error={formErrors.price}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Stok *"
                  value={formData.stock}
                  onChangeText={(text) => {
                    setFormData({ ...formData, stock: text.replace(/[^0-9]/g, '') });
                    if (formErrors.stock) {
                      setFormErrors({ ...formErrors, stock: '' });
                    }
                  }}
                  placeholder="0"
                  keyboardType="numeric"
                  error={formErrors.stock}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.halfInput}>
                <Input
                  label="Alert Stok Minimum"
                  value={formData.alertStock}
                  onChangeText={(text) => {
                    setFormData({ ...formData, alertStock: text.replace(/[^0-9]/g, '') });
                    if (formErrors.alertStock) {
                      setFormErrors({ ...formErrors, alertStock: '' });
                    }
                  }}
                  placeholder="5"
                  keyboardType="numeric"
                  error={formErrors.alertStock}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Barcode"
                  value={formData.barcode}
                  onChangeText={(text) => setFormData({ ...formData, barcode: text })}
                  placeholder="Scan atau ketik barcode"
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, formErrors.categoryId && styles.inputLabelError]}>
              Kategori *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryPickerItem,
                    formData.categoryId === category.id && styles.categoryPickerItemActive
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, categoryId: category.id });
                    if (formErrors.categoryId) {
                      setFormErrors({ ...formErrors, categoryId: '' });
                    }
                  }}
                >
                  <Text style={[
                    styles.categoryPickerText,
                    formData.categoryId === category.id && styles.categoryPickerTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {formErrors.categoryId && (
              <Text style={styles.errorText}>{formErrors.categoryId}</Text>
            )}

            <View style={styles.imageSection}>
              <Text style={styles.inputLabel}>Gambar Produk</Text>
              <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePicker}>
                {formData.imageUrl ? (
                  <View style={styles.selectedImageContainer}>
                    <Image source={{ uri: formData.imageUrl }} style={styles.selectedImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => setFormData({ ...formData, imageUrl: '' })}
                    >
                      <Ionicons name="close-circle" size={24} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={40} color={Colors.textMuted} />
                    <Text style={styles.imagePlaceholderText}>Pilih Gambar</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Batal"
              variant="outline"
              onPress={() => setIsModalVisible(false)}
              style={styles.cancelButton}
              disabled={isSubmitting}
            />
            <Button
              title={editingProduct ? 'Perbarui' : 'Simpan'}
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter & Urutkan</Text>
            <TouchableOpacity 
              onPress={() => {
                setFilters({
                  priceRange: { min: '', max: '' },
                  stockStatus: 'all',
                  sortBy: 'name',
                  sortOrder: 'asc'
                });
              }}
            >
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Rentang Harga</Text>
            <View style={styles.formRow}>
              <View style={styles.halfInput}>
                <Input
                  label="Harga Minimum"
                  value={filters.priceRange.min}
                  onChangeText={(text) => setFilters({
                    ...filters,
                    priceRange: { ...filters.priceRange, min: text.replace(/[^0-9]/g, '') }
                  })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Harga Maksimum"
                  value={filters.priceRange.max}
                  onChangeText={(text) => setFilters({
                    ...filters,
                    priceRange: { ...filters.priceRange, max: text.replace(/[^0-9]/g, '') }
                  })}
                  placeholder="999999"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Status Stok</Text>
            <View style={styles.stockStatusContainer}>
              {[
                { key: 'all', label: 'Semua', icon: 'apps-outline' },
                { key: 'inStock', label: 'Stok Aman', icon: 'checkmark-circle-outline' },
                { key: 'lowStock', label: 'Stok Menipis', icon: 'warning-outline' },
                { key: 'outOfStock', label: 'Habis', icon: 'close-circle-outline' },
              ].map((status) => (
                <TouchableOpacity
                  key={status.key}
                  style={[
                    styles.stockStatusButton,
                    filters.stockStatus === status.key && styles.stockStatusButtonActive
                  ]}
                  onPress={() => setFilters({ ...filters, stockStatus: status.key as any })}
                >
                  <Ionicons 
                    name={status.icon as any} 
                    size={20} 
                    color={filters.stockStatus === status.key ? Colors.white : Colors.textSecondary} 
                  />
                  <Text style={[
                    styles.stockStatusText,
                    filters.stockStatus === status.key && styles.stockStatusTextActive
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Urutkan Berdasarkan</Text>
            <View style={styles.sortContainer}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortButton,
                    filters.sortBy === option.key && styles.sortButtonActive
                  ]}
                  onPress={() => setFilters({ ...filters, sortBy: option.key as any })}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color={filters.sortBy === option.key ? Colors.white : Colors.textSecondary} 
                  />
                  <Text style={[
                    styles.sortText,
                    filters.sortBy === option.key && styles.sortTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Urutan</Text>
            <View style={styles.sortOrderContainer}>
              <TouchableOpacity
                style={[
                  styles.sortOrderButton,
                  filters.sortOrder === 'asc' && styles.sortOrderButtonActive
                ]}
                onPress={() => setFilters({ ...filters, sortOrder: 'asc' })}
              >
                <Ionicons 
                  name="arrow-up" 
                  size={20} 
                  color={filters.sortOrder === 'asc' ? Colors.white : Colors.textSecondary} 
                />
                <Text style={[
                  styles.sortOrderText,
                  filters.sortOrder === 'asc' && styles.sortOrderTextActive
                ]}>
                  A-Z / Rendah-Tinggi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortOrderButton,
                  filters.sortOrder === 'desc' && styles.sortOrderButtonActive
                ]}
                onPress={() => setFilters({ ...filters, sortOrder: 'desc' })}
              >
                <Ionicons 
                  name="arrow-down" 
                  size={20} 
                  color={filters.sortOrder === 'desc' ? Colors.white : Colors.textSecondary} 
                />
                <Text style={[
                  styles.sortOrderText,
                  filters.sortOrder === 'desc' && styles.sortOrderTextActive
                ]}>
                  Z-A / Tinggi-Rendah
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Tutup"
              onPress={() => setIsFilterModalVisible(false)}
              style={styles.fullWidthButton}
            />
          </View>
        </View>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        visible={isStockModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => !isSubmitting && setIsStockModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => !isSubmitting && setIsStockModalVisible(false)}
              disabled={isSubmitting}
            >
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Atur Stok</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {stockAdjustProduct && (
              <View style={styles.productSummary}>
                <Text style={styles.productSummaryTitle}>{stockAdjustProduct.name}</Text>
                <Text style={styles.productSummaryStock}>Stok Saat Ini: {stockAdjustProduct.stock}</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Jenis Penyesuaian</Text>
            <View style={styles.adjustmentTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.adjustmentTypeButton,
                  stockAdjustment.type === 'add' && styles.adjustmentTypeButtonActive
                ]}
                onPress={() => setStockAdjustment({ ...stockAdjustment, type: 'add' })}
              >
                <Ionicons 
                  name="add-circle-outline" 
                  size={24} 
                  color={stockAdjustment.type === 'add' ? Colors.white : Colors.success} 
                />
                <Text style={[
                  styles.adjustmentTypeText,
                  stockAdjustment.type === 'add' && styles.adjustmentTypeTextActive
                ]}>
                  Tambah Stok
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.adjustmentTypeButton,
                  stockAdjustment.type === 'remove' && styles.adjustmentTypeButtonActive
                ]}
                onPress={() => setStockAdjustment({ ...stockAdjustment, type: 'remove' })}
              >
                <Ionicons 
                  name="remove-circle-outline" 
                  size={24} 
                  color={stockAdjustment.type === 'remove' ? Colors.white : Colors.error} 
                />
                <Text style={[
                  styles.adjustmentTypeText,
                  stockAdjustment.type === 'remove' && styles.adjustmentTypeTextActive
                ]}>
                  Kurangi Stok
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Jumlah"
              value={stockAdjustment.amount}
              onChangeText={(text) => setStockAdjustment({ 
                ...stockAdjustment, 
                amount: text.replace(/[^0-9]/g, '') 
              })}
              placeholder="0"
              keyboardType="numeric"
            />

            <Input
              label="Alasan"
              value={stockAdjustment.reason}
              onChangeText={(text) => setStockAdjustment({ ...stockAdjustment, reason: text })}
              placeholder="Masukkan alasan penyesuaian stok"
              multiline
              numberOfLines={3}
            />

            {stockAdjustProduct && stockAdjustment.amount && (
              <View style={styles.stockPreview}>
                <Text style={styles.stockPreviewLabel}>Stok Setelah Penyesuaian:</Text>
                <Text style={styles.stockPreviewValue}>
                  {stockAdjustment.type === 'add' 
                    ? stockAdjustProduct.stock + parseInt(stockAdjustment.amount || '0')
                    : Math.max(0, stockAdjustProduct.stock - parseInt(stockAdjustment.amount || '0'))
                  }
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Batal"
              variant="outline"
              onPress={() => setIsStockModalVisible(false)}
              style={styles.cancelButton}
              disabled={isSubmitting}
            />
            <Button
              title="Simpan"
              onPress={handleStockAdjustment}
              style={styles.submitButton}
              loading={isSubmitting}
              disabled={isSubmitting || !stockAdjustment.amount || !stockAdjustment.reason}
            />
          </View>
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
    padding: 20,
    paddingTop: 60,
  } as ViewStyle,
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  headerButton: {
    padding: 8,
    marginLeft: 8,
  } as ViewStyle,
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
  } as ViewStyle,
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  } as ViewStyle,
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  } as TextStyle,
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  categoryFilter: {
    paddingHorizontal: 20,
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
  productsContainer: {
    flex: 1,
  } as ViewStyle,
  scrollContent: {
    paddingBottom: 100, // Space for tab bar
  } as ViewStyle,
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  } as ViewStyle,
  productCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  } as ViewStyle,
  productCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  } as ViewStyle,
  productImageContainer: {
    position: 'relative',
  } as ViewStyle,
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  } as ViewStyle,
  placeholderImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  lowStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.error,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  } as ViewStyle,
  lowStockText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: 'bold',
  } as TextStyle,
  productInfo: {
    padding: 12,
  } as ViewStyle,
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  } as TextStyle,
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.accent,
    marginBottom: 8,
  } as TextStyle,
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,
  productStock: {
    fontSize: 12,
    color: Colors.textMuted,
  } as TextStyle,
  productCategory: {
    fontSize: 12,
    color: Colors.textMuted,
  } as TextStyle,
  productBarcode: {
    fontSize: 12,
    color: Colors.textMuted,
  } as TextStyle,
  productActions: {
    flexDirection: 'row',
    padding: 8,
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  } as ViewStyle,
  actionButton: {
    padding: 8,
    marginLeft: 8,
  } as ViewStyle,
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  } as ViewStyle,
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  } as TextStyle,
  emptyStateButton: {
    marginTop: 16,
  } as ViewStyle,
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
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  } as ViewStyle,
  inputLabel: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: '600',
  } as TextStyle,
  categoryPicker: {
    marginBottom: 20,
  } as ViewStyle,
  categoryPickerItem: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  } as ViewStyle,
  categoryPickerItemActive: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  categoryPickerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  } as TextStyle,
  categoryPickerTextActive: {
    color: Colors.white,
  } as TextStyle,
  imageSection: {
    marginBottom: 20,
  } as ViewStyle,
  imagePickerButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  } as ViewStyle,
  selectedImageContainer: {
    position: 'relative',
  } as ViewStyle,
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  } as ImageStyle,
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: Colors.error,
  } as ViewStyle,
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  imagePlaceholderText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  } as TextStyle,
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'space-between',
  } as ViewStyle,
  cancelButton: {
    flex: 1,
    marginRight: 8,
  } as ViewStyle,
  submitButton: {
    flex: 1,
    marginLeft: 8,
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  loadingText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 16,
  } as TextStyle,
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  } as TextStyle,
  stockStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  stockStatusButton: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginRight: 8,
  } as ViewStyle,
  stockStatusButtonActive: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  stockStatusText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: 'bold',
  } as TextStyle,
  stockStatusTextActive: {
    color: Colors.white,
  } as TextStyle,
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  sortButton: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginRight: 8,
  } as ViewStyle,
  sortButtonActive: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  sortText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: 'bold',
  } as TextStyle,
  sortTextActive: {
    color: Colors.white,
  } as TextStyle,
  sortOrderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  sortOrderButton: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginRight: 8,
  } as ViewStyle,
  sortOrderButtonActive: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  sortOrderText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: 'bold',
  } as TextStyle,
  sortOrderTextActive: {
    color: Colors.white,
  } as TextStyle,
  fullWidthButton: {
    flex: 1,
  } as ViewStyle,
  row: {
    justifyContent: 'space-between',
  } as ViewStyle,
  resetText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  } as TextStyle,
  inputLabelError: {
    color: Colors.error,
  } as TextStyle,
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    marginBottom: 8,
  } as TextStyle,
  selectionCheckbox: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 2,
  } as ViewStyle,
  adjustmentTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  } as ViewStyle,
  adjustmentTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  } as ViewStyle,
  adjustmentTypeButtonActive: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  adjustmentTypeText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
    fontWeight: '600',
  } as TextStyle,
  adjustmentTypeTextActive: {
    color: Colors.white,
  } as TextStyle,
  stockPreview: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  } as ViewStyle,
  stockPreviewLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  } as TextStyle,
  stockPreviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  } as TextStyle,
  productSummary: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  } as ViewStyle,
  productSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  } as TextStyle,
  productSummaryStock: {
    fontSize: 14,
    color: Colors.textMuted,
  } as TextStyle,
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 8,
  } as TextStyle,
  selectionCheckbox: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  } as ViewStyle,
});

export default ProductsScreen; 