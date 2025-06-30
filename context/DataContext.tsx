import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    where,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { DataContextType, Product, Category, Transaction, CartItem } from '../types';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

interface DataProviderProps {
    children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Subscribe to categories
        const categoriesQuery = query(collection(db, 'categories'), orderBy('name'));
        const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
            const categoriesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Category[];
            setCategories(categoriesData);
        });

        // Subscribe to products
        const productsQuery = query(collection(db, 'products'), orderBy('name'));
        const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            setProducts(productsData);
        });

        // Subscribe to transactions (last 100)
        const transactionsQuery = query(
            collection(db, 'transactions'),
            orderBy('createdAt', 'desc')
        );
        const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
            const transactionsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Transaction[];
            setTransactions(transactionsData);
            setLoading(false);
        });

        return () => {
            unsubscribeCategories();
            unsubscribeProducts();
            unsubscribeTransactions();
        };
    }, []);

    // Category operations
    const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string; id?: string }> => {
        try {
            const docRef = await addDoc(collection(db, 'categories'), {
                ...categoryData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return { success: true, id: docRef.id };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const updateCategory = async (id: string, updates: Partial<Category>): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, 'categories', id), {
                ...updates,
                updatedAt: new Date()
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const deleteCategory = async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await deleteDoc(doc(db, 'categories', id));
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    // Product operations
    const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string; id?: string }> => {
        try {
            const docRef = await addDoc(collection(db, 'products'), {
                ...productData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return { success: true, id: docRef.id };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const updateProduct = async (id: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, 'products', id), {
                ...updates,
                updatedAt: new Date()
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await deleteDoc(doc(db, 'products', id));
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    // Transaction operations
    const createTransaction = async (
        transactionData: Omit<Transaction, 'id' | 'transactionNumber' | 'status' | 'createdAt' | 'updatedAt'>,
        cartItems: CartItem[]
    ): Promise<{ success: boolean; transactionNumber?: string; error?: string }> => {
        try {
            const batch = writeBatch(db);

            // Generate transaction number
            const transactionNumber = `TRX-${Date.now()}`;

            // Create transaction document
            const transactionRef = doc(collection(db, 'transactions'));
            batch.set(transactionRef, {
                ...transactionData,
                transactionNumber,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'completed'
            });

            // Update product stocks and add transaction details
            for (const item of cartItems) {
                const productRef = doc(db, 'products', item.id);
                batch.update(productRef, {
                    stock: increment(-item.quantity)
                });

                // Add transaction detail
                const detailRef = doc(collection(db, 'transactionDetails'));
                batch.set(detailRef, {
                    transactionId: transactionRef.id,
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    subtotal: item.price * item.quantity,
                    createdAt: new Date()
                });
            }

            await batch.commit();
            return { success: true, transactionNumber };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const getTransactionDetails = async (transactionId: string): Promise<{ success: boolean; details?: any[]; error?: string }> => {
        try {
            const detailsQuery = query(
                collection(db, 'transactionDetails'),
                where('transactionId', '==', transactionId)
            );
            const snapshot = await getDocs(detailsQuery);
            const details = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return { success: true, details };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    // Dashboard metrics
    const getDashboardMetrics = () => {
        const today = new Date();
        const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Filter transactions for last 7 days
        const recentTransactions = transactions.filter(transaction => {
            const transactionDate = transaction.createdAt && (transaction.createdAt as any).toDate ? 
                (transaction.createdAt as any).toDate() : new Date(transaction.createdAt);
            return transactionDate >= last7Days;
        });

        // Calculate metrics
        const totalRevenue = recentTransactions.reduce((sum, transaction) => sum + (transaction.totalAmount || 0), 0);
        const totalTransactions = recentTransactions.length;
        const totalProducts = products.length;

        // Low stock products (stock <= alertStock)
        const lowStockCount = products.filter(product =>
            product.stock <= (product.alertStock || 5)
        ).length;

        return {
            totalRevenue,
            totalTransactions,
            totalProducts,
            lowStockCount,
        };
    };

    const value: DataContextType = {
        products,
        categories,
        transactions,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        createTransaction,
        getTransactionDetails,
        getDashboardMetrics,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};