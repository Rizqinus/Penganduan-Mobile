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

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [emailOrNik, setEmailOrNik] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [isFocusedEmail, setIsFocusedEmail] = useState<boolean>(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!emailOrNik.trim() || !password.trim()) {
      const msg = 'Harap isi semua kolom.';
      setError(msg);
      Alert.alert('Login Gagal', msg, [{ text: 'OK' }]);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(emailOrNik, password);
      Alert.alert(
        'Login Berhasil',
        'Selamat datang kembali di Sistem Pengaduan!',
        [{ text: 'Masuk Dashboard', onPress: () => router.replace('/') }]
      );
    } catch (err: any) {
      const msg = err.message || 'Login gagal. Periksa kembali NIK/Email dan Kata Sandi Anda.';
      setError(msg);
      Alert.alert('Login Gagal', msg, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <SymbolView
              name={{ ios: 'road.lanes', android: 'add_road', web: 'add_road' }}
              size={32}
              tintColor="#b31c33"
            />
          </View>
          <Text style={styles.title}>Sistem Pengaduan</Text>
          <Text style={styles.subtitle}>Infrastruktur Jalan</Text>
          <Text style={styles.desc}>Masuk untuk melaporkan & melacak perbaikan.</Text>
        </View>

        <View style={styles.formContainer}>
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
            <Text style={styles.label}>Email / NIK</Text>
            <View style={[styles.inputWrapper, isFocusedEmail && styles.inputWrapperFocused]}>
              <SymbolView
                name={{ ios: 'person.text.rectangle.fill', android: 'badge', web: 'badge' }}
                size={18}
                tintColor={isFocusedEmail ? '#b31c33' : '#8e706f'}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.input}
                placeholder="Masukkan Email atau NIK"
                placeholderTextColor="#8e706f"
                value={emailOrNik}
                onChangeText={setEmailOrNik}
                autoCapitalize="none"
                onFocus={() => setIsFocusedEmail(true)}
                onBlur={() => setIsFocusedEmail(false)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kata Sandi</Text>
            <View style={[styles.inputWrapper, isFocusedPassword && styles.inputWrapperFocused]}>
              <SymbolView
                name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
                size={18}
                tintColor={isFocusedPassword ? '#b31c33' : '#8e706f'}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.input}
                placeholder="Kata sandi"
                placeholderTextColor="#8e706f"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                onFocus={() => setIsFocusedPassword(true)}
                onBlur={() => setIsFocusedPassword(false)}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.forgotBtn} onPress={() => Alert.alert('Lupa Sandi', 'Silakan hubungi admin wilayah Anda untuk mereset kata sandi.')}>
            <Text style={styles.forgotText}>Lupa Kata Sandi?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Masuk</Text>
                <SymbolView
                  name={{ ios: 'key.fill', android: 'vpn_key', web: 'vpn_key' }}
                  size={16}
                  tintColor="#ffffff"
                />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerLink}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </View>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  logoContainer: {
    width: 72,
    height: 72,
    backgroundColor: '#fff0ef',
    borderWidth: 1,
    borderColor: '#ffd6d6',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#b31c33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a0e0e',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#b31c33',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  desc: {
    fontSize: 14,
    color: '#6e5656',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f5eaea',
    shadowColor: '#b31c33',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
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
    marginBottom: 18,
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
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b31c33',
  },
  loginBtn: {
    backgroundColor: '#b31c33',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#b31c33',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#6e5656',
    fontSize: 14,
  },
  registerLink: {
    color: '#b31c33',
    fontWeight: '700',
    fontSize: 14,
  },
});
