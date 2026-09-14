import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Complaint } from '../types';
import api from '../services/api';

export default function LaporanListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ searchQuery?: string }>();
  const initialSearch = params.searchQuery || '';
  
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>(initialSearch);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [activeStatus, setActiveStatus] = useState<string>('Semua');

  const loadComplaints = async () => {
    try {
      const data = await api.getComplaints();
      setComplaints(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const filteredData = complaints.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    let matchesCategory = true;
    if (activeCategory !== 'Semua') {
      const categoryKeywords: Record<string, string[]> = {
        'Jalan': ['jalan', 'lubang'],
        'Lampu': ['lampu'],
        'Drainase': ['drainase', 'gorong', 'selokan', 'parit']
      };
      const keywords = categoryKeywords[activeCategory] || [];
      matchesCategory = keywords.some(keyword => 
        item.category.toLowerCase().includes(keyword) || 
        item.title.toLowerCase().includes(keyword)
      );
    }

    let matchesStatus = true;
    if (activeStatus === 'Proses') {
      matchesStatus = item.status === 'Diproses' || item.status === 'Diterima';
    } else if (activeStatus === 'Selesai') {
      matchesStatus = item.status === 'Selesai';
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const renderItem = ({ item }: { item: Complaint }) => {
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
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.badge, { backgroundColor: isUrgent ? '#ffdad6' : '#d7e97c' }]}>
              <Text style={[styles.badgeText, { color: isUrgent ? '#ba1a1a' : '#576500' }]}>
                {isUrgent ? 'Urgent' : item.status}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <SymbolView
              name={{ ios: 'mappin.and.ellipse', android: 'place', web: 'location_on' }}
              size={11}
              tintColor="#8e706f"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.cardLocation} numberOfLines={1}>{item.location}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardDate}>{item.date}</Text>
            <Text style={[styles.cardStatusLabel, { color: item.status === 'Selesai' ? '#006953' : '#ba1a1a' }]}>
              {item.status === 'Selesai' ? 'Selesai Diperbaiki' : (item.status === 'Diproses' ? 'Teknisi di Lokasi' : 'Dalam Antrean')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <SymbolView
            name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }}
            size={22}
            tintColor="#b31c33"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Semua Laporan</Text>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={16}
            tintColor="#8e706f"
            style={{ marginRight: 6 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari laporan..."
            placeholderTextColor="#8e706f"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.categoryScroll}>
          {['Semua', 'Jalan', 'Lampu', 'Drainase'].map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, isActive && styles.catChipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.statusTabs}>
          {['Semua', 'Proses', 'Selesai'].map((status) => {
            const isActive = activeStatus === status;
            return (
              <TouchableOpacity
                key={status}
                style={[styles.statusTab, isActive && styles.statusTabActive]}
                onPress={() => setActiveStatus(status)}
              >
                <Text style={[styles.statusTabText, isActive && styles.statusTabTextActive]}>
                  {status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#b31c33" style={{ marginTop: 24 }} />
      ) : filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SymbolView
            name={{ ios: 'tray', android: 'inbox', web: 'inbox' }}
            size={48}
            tintColor="#8e706f"
            style={{ marginBottom: 8 }}
          />
          <Text style={styles.emptyText}>Tidak ada laporan yang cocok.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
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
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe9e8',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    zIndex: 10,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#b31c33',
    marginLeft: 16,
  },
  filterSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ffe9e8',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0ef',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2bebd',
    paddingHorizontal: 10,
    height: 42,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#261818',
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff8f7',
    borderWidth: 1,
    borderColor: '#e2bebd',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: '#d63849',
    borderColor: '#d63849',
  },
  catChipText: {
    fontSize: 12,
    color: '#5a4040',
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#ffffff',
  },
  statusTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe9e8',
  },
  statusTab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 8,
  },
  statusTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#b31c33',
  },
  statusTabText: {
    fontSize: 13,
    color: '#5a4040',
    fontWeight: '600',
  },
  statusTabTextActive: {
    color: '#b31c33',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
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
  },
  cardImage: {
    width: 104,
    height: 104,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#261818',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  cardLocation: {
    fontSize: 11,
    color: '#5a4040',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardDate: {
    fontSize: 10,
    color: '#8e706f',
  },
  cardStatusLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#8e706f',
    marginTop: 8,
  },
});
