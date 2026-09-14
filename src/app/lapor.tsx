import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LaporScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [severity, setSeverity] = useState<string>('Sedang');
  const [description, setDescription] = useState<string>('');
  
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
          console.log('Permission for camera roll/camera was denied.');
        }
      }
    })();
  }, []);

  const handleSelectImage = () => {
    if (Platform.OS === 'web') {
      // On web browser, open the file explorer directly
      handleChooseGallery();
    } else {
      Alert.alert(
        'Unggah Foto Kejadian',
        'Pilih media pengambilan gambar:',
        [
          { text: 'Kamera', onPress: handleTakeCamera },
          { text: 'Galeri Foto', onPress: handleChooseGallery },
          { text: 'Batal', style: 'cancel' }
        ]
      );
    }
  };

  const handleTakeCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Data = result.assets[0].base64;
        const uri = `data:image/jpeg;base64,${base64Data}`;
        setImageUri(uri);
      }
    } catch (e) {
      Alert.alert('Gagal Menggunakan Kamera', 'Terjadi kesalahan saat memicu kamera Anda.');
    }
  };

  const handleChooseGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Data = result.assets[0].base64;
        const uri = `data:image/jpeg;base64,${base64Data}`;
        setImageUri(uri);
      }
    } catch (e) {
      Alert.alert('Gagal Mengakses Galeri', 'Terjadi kesalahan saat memicu galeri gambar.');
    }
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      if (Platform.OS === 'web') {
        alert('Validasi Laporan: Harap ambil atau pilih foto kejadian terlebih dahulu.');
      } else {
        Alert.alert('Validasi Laporan', 'Harap ambil atau pilih foto kejadian terlebih dahulu.');
      }
      return;
    }
    if (!address.trim()) {
      if (Platform.OS === 'web') {
        alert('Validasi Laporan: Harap isi lokasi kejadian terlebih dahulu.');
      } else {
        Alert.alert('Validasi Laporan', 'Harap isi lokasi kejadian terlebih dahulu.');
      }
      return;
    }
    if (!category.trim()) {
      if (Platform.OS === 'web') {
        alert('Validasi Laporan: Harap isi jenis kerusakan terlebih dahulu.');
      } else {
        Alert.alert('Validasi Laporan', 'Harap isi jenis kerusakan terlebih dahulu.');
      }
      return;
    }
    if (!description.trim()) {
      if (Platform.OS === 'web') {
        alert('Validasi Laporan: Harap isi deskripsi detail tentang laporan Anda.');
      } else {
        Alert.alert('Validasi Laporan', 'Harap isi deskripsi detail tentang laporan Anda.');
      }
      return;
    }

    setSubmitting(true);
    try {
      await api.createComplaint({
        title: `${category} di ${address.split(',')[0]}`,
        description,
        category,
        severity,
        location: address,
        reporter: user?.name || 'Budi Santoso',
        image: imageUri
      });

      if (Platform.OS === 'web') {
        alert('Laporan Dikirim: Laporan infrastruktur Anda berhasil terkirim ke dinas terkait dan tercatat di sistem.');
        setImageUri(null);
        setAddress('');
        setDescription('');
        setSeverity('Sedang');
        setCategory('');
        router.replace('/');
      } else {
        Alert.alert(
          'Laporan Dikirim',
          'Laporan infrastruktur Anda berhasil terkirim ke dinas terkait dan tercatat di sistem.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                setImageUri(null);
                setAddress('');
                setDescription('');
                setSeverity('Sedang');
                setCategory('');
                router.replace('/');
              }
            }
          ]
        );
      }
    } catch (err: any) {
      const msg = err.message || 'Terjadi kesalahan saat memproses laporan.';
      if (Platform.OS === 'web') {
        alert(`Gagal Mengirim Laporan: ${msg}`);
      } else {
        Alert.alert('Gagal Mengirim Laporan', msg);
      }
    } finally {
      setSubmitting(false);
    }
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
        <Text style={styles.headerTitle}>Buat Laporan Baru</Text>
        <View style={styles.avatarInitial}>
          <Text style={styles.avatarInitialText}>{(user?.name || 'W').charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Laporkan Kerusakan</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Foto Kejadian</Text>
          <View style={styles.imageSelectorRow}>
            <TouchableOpacity style={styles.imageSelector} onPress={handleSelectImage}>
              <SymbolView
                name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
                size={24}
                tintColor="#b31c33"
              />
              <Text style={styles.selectorText}>Tambah Foto</Text>
            </TouchableOpacity>

            <View style={styles.imagePreview}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <SymbolView
                    name={{ ios: 'photo.fill', android: 'image', web: 'image' }}
                    size={32}
                    tintColor="#8e706f"
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Lokasi Kejadian</Text>
          <TextInput
            style={styles.descriptionTextarea}
            value={address}
            onChangeText={setAddress}
            placeholder="Masukkan alamat lengkap atau detail lokasi kejadian (Contoh: Jl. Sudirman No.45, dekat tiang lampu 12)"
            placeholderTextColor="#8e706f"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Jenis Kerusakan</Text>
          <TextInput
            style={styles.textInput}
            value={category}
            onChangeText={setCategory}
            placeholder="Masukkan jenis kerusakan (Contoh: Tiang listrik roboh, Jalan berlubang)"
            placeholderTextColor="#8e706f"
          />

          <Text style={[styles.cardLabel, { marginTop: 16 }]}>Tingkat Keparahan</Text>
          <View style={styles.severityRow}>
            {['Ringan', 'Sedang', 'Parah'].map((level) => {
              const selected = severity === level;
              return (
                <TouchableOpacity
                  key={level}
                  style={[styles.severityChip, selected && styles.severityChipActive]}
                  onPress={() => setSeverity(level)}
                >
                  <Text style={[styles.severityText, selected && styles.severityTextActive]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.cardLabel, { marginTop: 16 }]}>Deskripsi Kerusakan</Text>
          <TextInput
            style={styles.descriptionTextarea}
            placeholder="Deskripsi detail kerusakan, contoh: Diameter lubang, kedalaman, dampak terhadap lalu lintas..."
            placeholderTextColor="#8e706f"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <SymbolView
                name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }}
                size={18}
                tintColor="#ffffff"
              />
              <Text style={styles.submitBtnText}>Kirim Laporan</Text>
            </>
          )}
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#261818',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#261818',
    marginBottom: 12,
  },
  imageSelectorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageSelector: {
    flex: 2,
    aspectRatio: 1.6,
    backgroundColor: '#fff8f7',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e2bebd',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  selectorText: {
    fontSize: 12,
    color: '#b31c33',
    fontWeight: '700',
  },
  imagePreview: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#ffe9e8',
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  severityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff8f7',
    borderWidth: 1,
    borderColor: '#e2bebd',
    alignItems: 'center',
  },
  severityChipActive: {
    backgroundColor: '#b31c33',
    borderColor: '#b31c33',
  },
  severityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5a4040',
  },
  severityTextActive: {
    color: '#ffffff',
  },
  descriptionTextarea: {
    backgroundColor: '#fff8f7',
    borderWidth: 1,
    borderColor: '#e2bebd',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#261818',
    height: 96,
  },
  textInput: {
    backgroundColor: '#fff8f7',
    borderWidth: 1,
    borderColor: '#e2bebd',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: '#261818',
  },
  submitBtn: {
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
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#e2bebd',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
