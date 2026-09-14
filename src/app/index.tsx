import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useAuth } from '../context/AuthContext';
import { Complaint } from '../types';
import api from '../services/api';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const loadData = async () => {
    try {
      const data = await api.getComplaints();
      setComplaints(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const pendingCount = complaints.filter(c => c.status === 'Diterima' || c.status === 'Diproses').length;
  const resolvedCount = complaints.filter(c => c.status === 'Selesai').length;

  const renderComplaintItem = ({ item }: { item: Complaint }) => {
    const isUrgent = item.severity === 'Parah';
    const borderLeftColor = item.status === 'Selesai' ? '#006953' : (isUrgent ? '#ba1a1a' : '#f59e0b');
    
    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftColor }]}
        onPress={() => router.push({ pathname: '/detail', params: { id: item.id } })}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.badge, { backgroundColor: isUrgent ? '#ffdad6' : '#fff3cd' }]}>
              <Text style={[styles.badgeText, { color: isUrgent ? '#93000a' : '#856404' }]}>
                {item.severity}
              </Text>
            </View>
            <Text style={styles.cardDate}>{item.date}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.cardLocationContainer}>
            <SymbolView
              name={{ ios: 'mappin.and.ellipse', android: 'place', web: 'location_on' }}
              size={14}
              tintColor="#8e706f"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.cardLocation} numberOfLines={1}>{item.location}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        <View style={styles.avatarInitial}>
          <Text style={styles.avatarInitialText}>{(user?.name || 'W').charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#b31c33']} />}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Halo, {user?.name || 'Warga'}!</Text>
          <Text style={styles.welcomeSub}>Mari bersama jaga infrastruktur kota.</Text>
        </View>

        <View style={styles.searchContainer}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={16}
            tintColor="#8e706f"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari laporan..."
            placeholderTextColor="#8e706f"
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              if (text.trim()) {
                router.push({ pathname: '/laporan-list', params: { searchQuery: text } });
              }
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.laporBtn}
          onPress={() => router.push('/lapor')}
        >
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            size={18}
            tintColor="#ffffff"
          />
          <Text style={styles.laporBtnText}>Kirim Laporan Baru</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#ffdad6' }]}>
              <SymbolView
                name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
                size={18}
                tintColor="#ba1a1a"
              />
            </View>
            <Text style={styles.statCount}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Perlu Tindakan</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#f5fff9' }]}>
              <SymbolView
                name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                size={18}
                tintColor="#006953"
              />
            </View>
            <Text style={styles.statCount}>{resolvedCount}</Text>
            <Text style={styles.statLabel}>Selesai Diperbaiki</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Laporan Terkini</Text>
          <TouchableOpacity onPress={() => router.push('/laporan-list')}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#b31c33" style={{ marginTop: 20 }} />
        ) : complaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SymbolView
              name={{ ios: 'info.circle', android: 'info', web: 'info' }}
              size={28}
              tintColor="#8e706f"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.emptyText}>Belum ada laporan complaint.</Text>
          </View>
        ) : (
          <FlatList
            data={complaints.slice(0, 4)}
            renderItem={renderComplaintItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}
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
  avatarInitial: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffdad6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2bebd',
  },
  avatarInitialText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ba1a1a',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#261818',
  },
  welcomeSub: {
    fontSize: 14,
    color: '#5a4040',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0ef',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2bebd',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#261818',
  },
  laporBtn: {
    backgroundColor: '#b31c33',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#b31c33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  laporBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#261818',
  },
  statLabel: {
    fontSize: 11,
    color: '#5a4040',
    fontWeight: '500',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#261818',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#b31c33',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderLeftWidth: 4,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    height: 96,
  },
  cardImage: {
    width: 96,
    height: 96,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardDate: {
    fontSize: 10,
    color: '#8e706f',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#261818',
    marginBottom: 4,
  },
  cardLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cardLocation: {
    fontSize: 11,
    color: '#5a4040',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#8e706f',
    fontSize: 14,
    marginTop: 8,
  },
});
