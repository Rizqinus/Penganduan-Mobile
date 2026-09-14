import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Complaint } from '../types';
import api from '../services/api';

export default function DetailLaporanScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentText, setCommentText] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  const isOwner = user && complaint && complaint.reporter === user.name;

  const handleDelete = () => {
    if (!complaint) return;
    const confirmDelete = async () => {
      try {
        setLoading(true);
        await api.deleteComplaint(complaint.id);
        if (Platform.OS === 'web') {
          alert('Sukses: Laporan berhasil dihapus.');
        } else {
          Alert.alert('Sukses', 'Laporan berhasil dihapus.');
        }
        router.replace('/');
      } catch (e) {
        if (Platform.OS === 'web') {
          alert('Gagal Menghapus: Terjadi kesalahan saat menghapus laporan.');
        } else {
          Alert.alert('Gagal Menghapus', 'Terjadi kesalahan saat menghapus laporan.');
        }
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Hapus Laporan',
        'Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Hapus', style: 'destructive', onPress: confirmDelete }
        ]
      );
    }
  };

  const loadDetail = async () => {
    try {
      const data = await api.getComplaints();
      const item = data.find(c => c.id === id);
      if (item) {
        setComplaint(item);
      } else {
        Alert.alert('Eror', 'Laporan tidak ditemukan.', [
          { text: 'Kembali', onPress: () => router.back() }
        ]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Gagal Memuat', 'Terjadi kesalahan saat memuat detail laporan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !id) {
      return;
    }

    setSubmittingComment(true);
    try {
      const authorName = user?.name || 'Budi Santoso';
      await api.addComment(id, commentText, authorName);
      setCommentText('');
      await loadDetail();
    } catch (e) {
      Alert.alert('Gagal Mengirim', 'Komentar gagal diposting.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#b31c33" />
      </View>
    );
  }

  if (!complaint) return null;

  const isUrgent = complaint.severity === 'Parah';

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
        <Text style={styles.headerTitle}>Detail Laporan</Text>
        <Text style={styles.headerId}>{complaint.id}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Image source={{ uri: complaint.image }} style={styles.complaintImage} />

          <View style={styles.contentContainer}>
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: isUrgent ? '#ffdad6' : '#fff3cd' }]}>
                <Text style={[styles.badgeText, { color: isUrgent ? '#ba1a1a' : '#856404' }]}>
                  {isUrgent ? 'Urgent · Darurat' : `Kategori ${complaint.severity}`}
                </Text>
              </View>
              <Text style={styles.statusLabel}>{complaint.status}</Text>
            </View>

            <Text style={styles.title}>{complaint.title}</Text>

            <View style={styles.infoGroup}>
              <View style={styles.infoRow}>
                <SymbolView
                  name={{ ios: 'mappin.and.ellipse', android: 'place', web: 'location_on' }}
                  size={14}
                  tintColor="#b31c33"
                />
                <Text style={styles.infoText}>{complaint.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <SymbolView
                  name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }}
                  size={12}
                  tintColor="#8e706f"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.metaText}>{complaint.date} · </Text>
                <SymbolView
                  name={{ ios: 'person.fill', android: 'person', web: 'person' }}
                  size={12}
                  tintColor="#8e706f"
                  style={{ marginRight: 4, marginLeft: 8 }}
                />
                <Text style={styles.metaText}>{complaint.reporter}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deskripsi</Text>
              <Text style={styles.description}>{complaint.description}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status Perbaikan</Text>
              <View style={styles.timeline}>
                {complaint.timeline.map((step, idx) => {
                  const done = step.done || complaint.status === 'Selesai' || (idx === 0) || (idx === 1 && complaint.status === 'Diproses');
                  return (
                    <View key={idx} style={styles.timelineItem}>
                      <View style={styles.timelineIndicator}>
                        <View style={[styles.timelineNode, done ? styles.nodeDone : styles.nodePending]}>
                          {done ? (
                            <SymbolView
                              name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                              size={10}
                              tintColor="#ffffff"
                            />
                          ) : (
                            <SymbolView
                              name={{ ios: 'hourglass', android: 'hourglass_empty', web: 'hourglass_empty' }}
                              size={10}
                              tintColor="#8e706f"
                            />
                          )}
                        </View>
                        {idx < complaint.timeline.length - 1 && (
                          <View style={[styles.timelineLine, done ? styles.lineDone : styles.linePending]} />
                        )}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={[styles.timelineStepTitle, !done && styles.textMuted]}>
                          {step.title}
                        </Text>
                        <Text style={styles.timelineStepDesc}>
                          {step.description}
                        </Text>
                        {step.date && step.date !== '--' && (
                          <Text style={styles.timelineStepDate}>{step.date}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Komentar ({complaint.comments.length})</Text>
              <View style={styles.commentsList}>
                {complaint.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentBox}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{comment.author}</Text>
                      <Text style={styles.commentDate}>{comment.date}</Text>
                    </View>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  </View>
                ))}
              </View>
            </View>

            {isOwner && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={handleDelete}
                >
                  <SymbolView
                    name={{ ios: 'trash.fill', android: 'delete', web: 'delete' }}
                    size={16}
                    tintColor="#ba1a1a"
                  />
                  <Text style={styles.deleteBtnText}>Hapus Laporan Ini</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Tulis tanggapan atau laporan tambahan..."
            placeholderTextColor="#8e706f"
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleAddComment}
            disabled={submittingComment || !commentText.trim()}
          >
            {submittingComment ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <SymbolView
                name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }}
                size={16}
                tintColor="#ffffff"
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f7',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    flex: 1,
  },
  headerId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5a4040',
  },
  scrollContent: {
    paddingBottom: 24,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  complaintImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  contentContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b31c33',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#261818',
    marginBottom: 12,
  },
  infoGroup: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#261818',
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: '#8e706f',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#ffe9e8',
    marginVertical: 16,
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#261818',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#5a4040',
    lineHeight: 20,
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 12,
    width: 24,
  },
  timelineNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeDone: {
    backgroundColor: '#b31c33',
  },
  nodePending: {
    backgroundColor: '#fff0ef',
    borderWidth: 1.5,
    borderColor: '#e2bebd',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: -2,
    zIndex: 1,
  },
  lineDone: {
    backgroundColor: '#b31c33',
  },
  linePending: {
    backgroundColor: '#ffe9e8',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineStepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#261818',
  },
  textMuted: {
    color: '#8e706f',
  },
  timelineStepDesc: {
    fontSize: 12,
    color: '#5a4040',
    marginTop: 2,
  },
  timelineStepDate: {
    fontSize: 10,
    color: '#8e706f',
    marginTop: 4,
    fontWeight: '500',
  },
  commentsList: {
    gap: 12,
    marginTop: 8,
  },
  commentBox: {
    backgroundColor: '#fff8f7',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffe9e8',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b31c33',
  },
  commentDate: {
    fontSize: 10,
    color: '#8e706f',
  },
  commentContent: {
    fontSize: 13,
    color: '#261818',
    lineHeight: 18,
  },
  commentInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#ffe9e8',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#fff8f7',
    borderWidth: 1,
    borderColor: '#e2bebd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
    color: '#261818',
    maxHeight: 72,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#b31c33',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#b31c33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ba1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  deleteBtnText: {
    color: '#ba1a1a',
    fontSize: 15,
    fontWeight: '700',
  },
});
