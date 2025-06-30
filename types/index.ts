// User and Auth Types
export interface User {
  uid: string;
  email: string | null;
  name?: string;
  role?: 'admin' | 'kasir';
  phone?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface AuthContextType {
  user: any | null; // Firebase User
  userProfile: User | null;
  userRole: 'admin' | 'kasir' | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  fetchUserProfile: (uid: string) => Promise<void>;
}

// Product Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  alertStock?: number;
  categoryId: string;
  imageUrl?: string;
  barcode?: string;
  createdAt?: any;
  updatedAt?: any;
}

// Transaction Types
export interface TransactionDetail {
  id: string;
  transactionId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  transactionNumber?: string;
  userId: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'qris';
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

// Cart Types
export interface CartItem extends Product {
  quantity: number;
}

// Data Context Types
export interface DataContextType {
  // Products
  products: Product[];
  categories: Category[];
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Categories
  addCategory: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  updateCategory: (id: string, categoryData: Partial<Category>) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Transactions
  transactions: Transaction[];
  createTransaction: (
    transactionData: Omit<Transaction, 'id' | 'transactionNumber' | 'status' | 'createdAt' | 'updatedAt'>,
    cartItems: CartItem[]
  ) => Promise<{ success: boolean; transactionNumber?: string; error?: string }>;
  getTransactionDetails: (transactionId: string) => Promise<{ success: boolean; details?: TransactionDetail[]; error?: string }>;
  
  // Dashboard
  getDashboardMetrics: () => {
    totalRevenue: number;
    totalTransactions: number;
    totalProducts: number;
    lowStockCount: number;
  };
}

// Component Props Types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: any;
}

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  icon?: React.ReactNode;
  editable?: boolean;
  style?: any;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Dashboard: undefined;
  Products: undefined;
  Transactions: undefined;
  NewTransaction: undefined;
  TransactionDetail: { transaction: Transaction };
  Reports: undefined;
  Settings: undefined;
  Profile: undefined;
};

export type ScreenNavigationProp = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
  replace: (screen: keyof RootStackParamList, params?: any) => void;
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  alertStock: string;
  categoryId: string;
  imageUrl: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
  }>;
}

// Report Types
export interface ReportData {
  [key: string]: any;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalTransactions: number;
  totalProducts: number;
  lowStockCount: number;
  recentTransactions: Transaction[];
  topProducts: Product[];
} 