import { Slot, usePathname, useRouter, DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { SymbolView } from 'expo-symbols';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '../context/AuthContext';

function CustomBottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { name: 'Home', path: '/', symbol: { ios: 'house.fill', android: 'home', web: 'home' } },
    { name: 'Lapor', path: '/lapor', symbol: { ios: 'square.and.pencil', android: 'edit', web: 'edit' } },
    { name: 'Profil', path: '/profil', symbol: { ios: 'person.fill', android: 'person', web: 'person' } },
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.path}
            style={styles.navItem}
            onPress={() => router.replace(tab.path as any)}
            activeOpacity={0.7}
          >
            <SymbolView
              name={tab.symbol as any}
              size={20}
              tintColor={isActive ? '#b31c33' : '#8e706f'}
              style={[{ marginBottom: 2 }, isActive && { transform: [{ scale: 1.15 }] }]}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AppContent() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Redirect Gate logic for Expo Router
  useEffect(() => {
    if (loading) return;

    const onAuthPage = pathname === '/login' || pathname === '/register';

    if (!isAuthenticated && !onAuthPage) {
      router.replace('/register');
    } else if (isAuthenticated && onAuthPage) {
      router.replace('/');
    }
  }, [isAuthenticated, loading, pathname]);

  const isTabScreen = pathname === '/' || pathname === '/lapor' || pathname === '/profil';

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff8f7' }}>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
        {isTabScreen && <CustomBottomNavbar />}
      </View>
    </ThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#ffe9e8',
    paddingBottom: 8,
    paddingTop: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navEmoji: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.6,
  },
  navEmojiActive: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8e706f',
  },
  navLabelActive: {
    color: '#b31c33',
    fontWeight: '800',
  },
});
