import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const secureSessionStorage = {
  async getItem(key: string) {
    const secureValue = await SecureStore.getItemAsync(key);
    if (secureValue !== null) return secureValue;

    const legacyValue = await AsyncStorage.getItem(key);
    if (legacyValue === null) return null;

    await SecureStore.setItemAsync(key, legacyValue);
    await AsyncStorage.removeItem(key);
    return legacyValue;
  },
  async setItem(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
    await AsyncStorage.removeItem(key);
  },
  async removeItem(key: string) {
    await Promise.all([
      SecureStore.deleteItemAsync(key),
      AsyncStorage.removeItem(key),
    ]);
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: secureSessionStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
