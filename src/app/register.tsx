import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [nik, setNik] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [agree, setAgree] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [isFocusedName, setIsFocusedName] = useState<boolean>(false);
  const [isFocusedNik, setIsFocusedNik] = useState<boolean>(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState<boolean>(false);
  const [isFocusedPhone, setIsFocusedPhone] = useState<boolean>(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState<boolean>(false);
  const [isFocusedConfirm, setIsFocusedConfirm] = useState<boolean>(false);

  const handleRegister = async () => {
    setError('');
    if (!name || !nik || !email || !phone || !password || !confirmPassword) {
      const msg = 'Harap isi semua kolom.';
      setError(msg);
      Alert.alert('Registrasi Gagal', msg, [{ text: 'OK' }]);
      return;
    }
    if (nik.length !== 16) {
      const msg = 'NIK harus berjumlah 16 digit.';
      setError(msg);
      Alert.alert('Registrasi Gagal', msg, [{ text: 'OK' }]);
      return;
    }
    if (password !== confirmPassword) {
      const msg = 'Konfirmasi kata sandi tidak cocok.';
      setError(msg);
      Alert.alert('Registrasi Gagal', msg, [{ text: 'OK' }]);
      return;
    }
    if (!agree) {
      const msg = 'Anda harus menyetujui Syarat & Ketentuan.';
      setError(msg);
      Alert.alert('Registrasi Gagal', msg, [{ text: 'OK' }]);
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        nik,
        email,
        phone,
        password
      });
      Alert.alert(
        'Pendaftaran Sukses',
        'Akun Anda telah berhasil dibuat. Silakan login.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (err: any) {
      const msg = err.message || 'Pendaftaran gagal. Silakan coba lagi.';
      setError(msg);
      Alert.alert('Registrasi Gagal', msg, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/login')} style={styles.backBtn}>
          <SymbolView
            name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }}
            size={20}
            tintColor="#b31c33"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Akun</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.logoInfo}>
          <View style={styles.logoWrapper}>
            <SymbolView
              name={{ ios: 'doc.text.fill', android: 'assignment', web: 'assignment' }}
              size={32}
              tintColor="#ffffff"
            />
          </View>
          <Text style={styles.title}>Buat Akun Baru</Text>
          <Text style={styles.subtitle}>Lengkapi data diri Anda</Text>
        </View>

        <View style={styles.formCard}>
          {error ? (
            <View style={styles.errorAlert}>
              <SymbolView
                name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
                size={16}
                tintColor="#ba1a1a"
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <View style={[styles.inputWrapper, isFocusedName && styles.inputWrapperFocused]}>
              <SymbolView
                name={{ ios: 'person.fill', android: 'person', web: 'person' }}
                size={16}
                tintColor={isFocusedName ? '#b31c33' : '#8e706f'}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.input}
                placeholder="Nama lengkap sesuai KTP"
                placeholderTextColor="#8e706f"
                value={name}
                onChangeText={setName}
                onFocus={() => setIsFocusedName(true)}
                onBlur={() => setIsFocusedName(false)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>NIK</Text>
            <View style={[styles.inputWrapper, isFocusedNik && styles.inputWrapperFocused]}>
              <SymbolView
                name={{ ios: 'person.text.rectangle.fill', android: 'badge', web: 'badge' }}
                size={16}
                tintColor={isFocusedNik ? '#b31c33' : '#8e706f'}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.input}
                placeholder="16 digit NIK"
                placeholderTextColor="#8e706f"
                keyboardType="numeric"
                maxLength={16}
                value={nik}
                onChangeText={setNik}
                onFocus={() => setIsFocusedNik(true)}
                onBlur={() => setIsFocusedNik(false)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, isFocusedEmail && styles.inputWrapperFocused]}>
              <SymbolView
                name={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }}
                size={16}
                tintColor={isFocusedEmail ? '#b31c33' : '#8e706f'}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.input}
                placeholder="email@contoh.com"
                placeholderTextColor="#8e706f"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setIsFocusedEmail(true)}
                onBlur={() => setIsFocusedEmail(false)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>No. Telepon</Text>
            <View style={[styles.inputWrapper, isFocusedPhone && styles.inputWrapperFocused]}>
              <SymbolView
                name={{ ios: 'phone.fill', android: 'phone', web: 'phone' }}
                size={16}
                tintColor={isFocusedPhone ? '#b31c33' : '#8e706f'}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.input}
                placeholder="0812xxxx"
                placeholderTextColor="#8e706f"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setIsFocusedPhone(true)}
                onBlur={() => setIsFocusedPhone(false)}
              />
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
              <Text style={styles.label}>Kata Sandi</Text>
              <View style={[styles.inputWrapper, isFocusedPassword && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="Sandi"
                  placeholderTextColor="#8e706f"
                  secureTextEntry
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setIsFocusedPassword(true)}
                  onBlur={() => setIsFocusedPassword(false)}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 6 }]}>
              <Text style={styles.label}>Konfirmasi</Text>
              <View style={[styles.inputWrapper, isFocusedConfirm && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="Ulangi"
                  placeholderTextColor="#8e706f"
                  secureTextEntry
                  autoCapitalize="none"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setIsFocusedConfirm(true)}
                  onBlur={() => setIsFocusedConfirm(false)}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgree(!agree)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agree && styles.checkboxActive]}>
              {agree && (
                <SymbolView
                  name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                  size={11}
                  tintColor="#ffffff"
                />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Saya menyetujui Syarat & Ketentuan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.registerBtnText}>Daftar</Text>
                <SymbolView
                  name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
                  size={16}
                  tintColor="#ffffff"
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcfc',
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
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#b31c33',
    marginLeft: 16,
    letterSpacing: -0.5,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  logoInfo: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  logoWrapper: {
    width: 64,
    height: 64,
    backgroundColor: '#b31c33',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#b31c33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a0e0e',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6e5656',
    marginTop: 4,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f5eaea',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdad6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#ffb4ab',
  },
  errorText: {
    color: '#ba1a1a',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#261818',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f7',
    borderWidth: 1.5,
    borderColor: '#e8dbdb',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: '#b31c33',
    backgroundColor: '#ffffff',
    shadowColor: '#b31c33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#261818',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#b31c33',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#b31c33',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#6e5656',
    fontWeight: '600',
  },
  registerBtn: {
    backgroundColor: '#b31c33',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#b31c33',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 8,
  },
  registerBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
