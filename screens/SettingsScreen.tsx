import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

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

const SettingsScreen: React.FC = () => {
  const { userProfile, userRole, logout } = useAuth();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState<boolean>(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [autoBackup, setAutoBackup] = useState<boolean>(false);

  const profileData = {
    name: userProfile?.name || 'User',
    email: userProfile?.email || 'user@example.com',
    phone: userProfile?.phone || '',
  };

  const passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const handleLogout = (): void => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar dari aplikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert('Error', result.error || 'Gagal logout');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = (): void => {
    Alert.alert('Info', 'Fitur edit profil akan segera tersedia');
  };

  const handleChangePassword = (): void => {
    Alert.alert('Info', 'Fitur ubah password akan segera tersedia');
  };

  const handleBackup = (): void => {
    Alert.alert('Info', 'Fitur backup data akan segera tersedia');
  };

  const handleExport = (): void => {
    Alert.alert('Info', 'Fitur export data akan segera tersedia');
  };

  const handleHelp = (): void => {
    Alert.alert(
      'Bantuan & Dukungan',
      'NexPOS Mobile v1.0.0\n\nUntuk bantuan teknis:\n- Email: support@nexpos.com\n- WhatsApp: +62 812-3456-7890\n\nPanduan lengkap tersedia di menu Help Center.',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = (): void => {
    Alert.alert(
      'Tentang NexPOS',
      'NexPOS Mobile - Sistem Point of Sale Modern\nVersi: 1.0.0\nBuild: 2024.12.28\n\nDikembangkan dengan React Native & Firebase\n\n© 2024 NexPOS. All rights reserved.',
      [{ text: 'OK' }]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    description: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    showChevron: boolean = true
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={20} color={Colors.accent} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {rightElement || (showChevron && onPress && (
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      ))}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pengaturan</Text>
        <Text style={styles.subtitle}>Kelola profil dan preferensi</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profil</Text>
        
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {profileData.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileData.name}</Text>
            <Text style={styles.profileEmail}>{profileData.email}</Text>
            <View style={styles.profileRole}>
              <Text style={styles.profileRoleText}>
                {userRole === 'admin' ? 'Administrator' : 'Kasir'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="pencil" size={20} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {renderSettingItem(
          'lock-closed',
          'Ubah Password',
          'Ganti password untuk keamanan akun',
          handleChangePassword
        )}
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pengaturan Aplikasi</Text>
        
        {renderSettingItem(
          'notifications',
          'Notifikasi',
          'Terima pemberitahuan penting',
          undefined,
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: Colors.border, true: Colors.accent }}
            thumbColor={notifications ? Colors.white : Colors.textMuted}
          />,
          false
        )}

        {renderSettingItem(
          'moon',
          'Mode Gelap',
          'Tampilan tema gelap (aktif)',
          undefined,
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: Colors.border, true: Colors.accent }}
            thumbColor={darkMode ? Colors.white : Colors.textMuted}
          />,
          false
        )}

        {userRole === 'admin' && renderSettingItem(
          'cloud-upload',
          'Auto Backup',
          'Backup otomatis data harian',
          undefined,
          <Switch
            value={autoBackup}
            onValueChange={setAutoBackup}
            trackColor={{ false: Colors.border, true: Colors.accent }}
            thumbColor={autoBackup ? Colors.white : Colors.textMuted}
          />,
          false
        )}
      </View>

      {/* Data Management */}
      {userRole === 'admin' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manajemen Data</Text>
          
          {renderSettingItem(
            'download',
            'Backup Data',
            'Backup manual data aplikasi',
            handleBackup
          )}

          {renderSettingItem(
            'document-text',
            'Export Laporan',
            'Export data laporan ke file',
            handleExport
          )}
        </View>
      )}

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bantuan & Dukungan</Text>
        
        {renderSettingItem(
          'help-circle',
          'Pusat Bantuan',
          'FAQ dan panduan penggunaan',
          handleHelp
        )}

        {renderSettingItem(
          'information-circle',
          'Tentang Aplikasi',
          'Informasi versi dan developer',
          handleAbout
        )}
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>NexPOS Mobile v1.0.0</Text>
        <Text style={styles.footerText}>Build 2024.12.28</Text>
      </View>
    </ScrollView>
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
  section: {
    marginBottom: 24,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    paddingHorizontal: 20,
  } as TextStyle,
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  } as ViewStyle,
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,
  profileAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  } as TextStyle,
  profileInfo: {
    flex: 1,
  } as ViewStyle,
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  } as TextStyle,
  profileEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  } as TextStyle,
  profileRole: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  } as ViewStyle,
  profileRoleText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  } as TextStyle,
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  } as ViewStyle,
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,
  settingContent: {
    flex: 1,
  } as ViewStyle,
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  } as TextStyle,
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  } as TextStyle,
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
  } as ViewStyle,
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 8,
  } as TextStyle,
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  } as ViewStyle,
  footerText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  } as TextStyle,
});

export default SettingsScreen; 