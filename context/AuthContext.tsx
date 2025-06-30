import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'kasir' | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchUserProfile = async (uid: string): Promise<void> => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                setUserProfile(userData);
                setUserRole(userData.role || 'kasir');
            } else {
                // Create default profile if not exists
                const defaultProfile: Omit<User, 'uid'> = {
                    email: user?.email || '',
                    name: user?.email?.split('@')[0] || 'User',
                    role: 'kasir',
                    createdAt: new Date(),
                };

                await setDoc(doc(db, 'users', uid), { ...defaultProfile, uid });
                setUserProfile({ ...defaultProfile, uid });
                setUserRole('kasir');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setLoading(true);
            
            // Check if Firebase is properly initialized
            if (!isFirebaseInitialized()) {
                return { 
                    success: false, 
                    error: 'Sistem autentikasi tidak tersedia. Periksa koneksi internet Anda.' 
                };
            }
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await fetchUserProfile(user.uid);
            
            return { success: true };
        } catch (error: any) {
            const errorMessage = getFirebaseErrorMessage(error.code) || error.message || 'Terjadi kesalahan saat login';
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setLoading(true);
            
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Create user profile in Firestore
            const defaultProfile: Omit<User, 'uid'> = {
                email: email,
                name: name,
                role: 'kasir', // Default role
                createdAt: new Date(),
            };

            await setDoc(doc(db, 'users', user.uid), { ...defaultProfile, uid: user.uid });
            
            // Set user profile state
            setUserProfile({ ...defaultProfile, uid: user.uid });
            setUserRole('kasir');
            
            return { success: true };
        } catch (error: any) {
            let errorMessage = 'Terjadi kesalahan saat mendaftar';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email sudah terdaftar';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password terlalu lemah';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Format email tidak valid';
                    break;
                default:
                    errorMessage = error.message || 'Terjadi kesalahan saat mendaftar';
            }
            
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            setUserRole(null);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'Terjadi kesalahan saat logout' };
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            
            if (firebaseUser) {
                await fetchUserProfile(firebaseUser.uid);
            } else {
                setUserProfile(null);
                setUserRole(null);
            }
            
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        user,
        userProfile,
        userRole,
        loading,
        login,
        register,
        logout,
        fetchUserProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};