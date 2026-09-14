import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
  Alert,
  Platform
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Complaint } from '../types';
import api from '../services/api';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadUserComplaints = async () => {
    try {
      const data = await api.getComplaints();
      const filtered = data.filter(c => c.reporter === (user?.name || 'Budi Santoso'));
      setUserComplaints(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserComplaints();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUserComplaints();
  };

  const handleLogout = () => {
    const confirmLogout = async () => {
      await logout();
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      if (confirm('Apakah Anda yakin ingin keluar dari akun Anda?')) {
        confirmLogout();
      }
    } else {
      Alert.alert(
        'Keluar Aplikasi',
        'Apakah Anda yakin ingin keluar dari akun Anda?',
        [
          { text: 'Batal', style: 'cancel' },
          { 
            text: 'Keluar', 
            style: 'destructive',
            onPress: confirmLogout
          }
        ]
      );
    }
  };

  const resolvedCount = userComplaints.filter(c => c.status === 'Selesai').length;
  const processedCount = userComplaints.filter(c => c.status === 'Diproses' || c.status === 'Diterima').length;
  const rejectedCount = userComplaints.filter(c => c.status === 'Ditolak').length;

  const latestComplaint = userComplaints[0] || null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerMenu}>
          <SymbolView
            name={{ ios: 'line.horizontal.3', android: 'menu', web: 'menu' }}
            size={22}
            tintColor="#b31c33"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sistem Pengaduan</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.headerLogout}>
          <SymbolView
            name={{ ios: 'door.left.hand.open', android: 'logout', web: 'logout' }}
            size={18}
            tintColor="#b31c33"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#b31c33']} />}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{(user?.name || 'B').charAt(0).toUpperCase()}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn} onPress={() => Alert.alert('Ubah Foto', 'Fitur ubah foto profil akan segera hadir.')}>
              <SymbolView
                name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
                size={12}
                tintColor="#ffffff"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{user?.name || 'Budi Santoso'}</Text>
          <Text style={styles.email}>{user?.email || 'budi.santoso@warga.id'}</Text>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>NIK</Text>
              <Text style={styles.metaValue}>{user?.nik || '317409876543210'}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>No. Telp</Text>
              <Text style={styles.metaValue}>{user?.phone || '+62 812 3456 7890'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statCount, { color: '#006953' }]}>{resolvedCount}</Text>
            <Text style={styles.statLabel}>Laporan Selesai</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statProcessedHeader}>
              <Text style={[styles.statCount, { color: '#f59e0b' }]}>{processedCount}</Text>
              <SymbolView
                name={{ ios: 'hourglass', android: 'hourglass_empty', web: 'hourglass_empty' }}
                size={16}
                tintColor="#f59e0b"
              />
            </View>
            <Text style={styles.statLabel}>Diproses</Text>
          </View>
        </View>

        <View style={[styles.statBox, styles.statBoxFull]}>
          <View style={styles.statProcessedHeader}>
            <Text style={[styles.statCount, { color: '#ba1a1a' }]}>{rejectedCount}</Text>
            <SymbolView
              name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
              size={16}
              tintColor="#ba1a1a"
            />
          </View>
          <Text style={styles.statLabel}>Laporan Ditolak</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Laporan Terakhir</Text>
          <TouchableOpacity onPress={() => router.push('/laporan-list')}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {latestComplaint ? (
          <TouchableOpacity
            style={styles.latestComplaintCard}
            onPress={() => router.push({ pathname: '/detail', params: { id: latestComplaint.id } })}
          >
            <Image source={{ uri: latestComplaint.image }} style={styles.latestImage} />
            <View style={styles.latestContent}>
              <Text style={styles.latestTitle} numberOfLines={1}>{latestComplaint.title}</Text>
              <Text style={styles.latestMeta}>
                {latestComplaint.date} · {latestComplaint.status}
              </Text>
            </View>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={18}
              tintColor="#8e706f"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Anda belum pernah mengirim laporan.</Text>
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <SymbolView
            name={{ ios: 'door.left.hand.open', android: 'logout', web: 'logout' }}
            size={16}
            tintColor="#b31c33"
          />
          <Text style={styles.logoutBtnText}>Keluar Akun</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f7',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe9e8',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerMenu: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#b31c33',
  },
  headerLogout: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#ffdad6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffe9e8',
  },
  avatarLargeText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ba1a1a',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#b31c33',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#261818',
  },
  email: {
    fontSize: 13,
    color: '#5a4040',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#ffe9e8',
    width: '100%',
    marginVertical: 16,
  },
  metaRow: {
    flexDirection: 'row',
    width: '100%',
  },
  metaCol: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: '#8e706f',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#261818',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
  },
  statBoxFull: {
    marginBottom: 20,
  },
  statCount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#261818',
  },
  statProcessedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#5a4040',
    fontWeight: '500',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#261818',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b31c33',
  },
  latestComplaintCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ba1a1a',
  },
  latestImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
  },
  latestContent: {
    flex: 1,
  },
  latestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#261818',
  },
  latestMeta: {
    fontSize: 11,
    color: '#5a4040',
    marginTop: 4,
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 13,
    color: '#8e706f',
  },
  logoutBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#b31c33',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutBtnText: {
    color: '#b31c33',
    fontSize: 15,
    fontWeight: '700',
  },
});
