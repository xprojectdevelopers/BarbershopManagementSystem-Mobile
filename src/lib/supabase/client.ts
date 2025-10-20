import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Environment variables (Expo automatically exposes EXPO_PUBLIC_*)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Missing Supabase environment variables.');
}

// ✅ Initialize Supabase client first
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ✅ Session restoration helper
export const restoreSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error restoring session:', error.message);
      return null;
    }

    if (!session) {
      console.warn('⚠️ No active session found. Please log in again.');
    }

    return session;
  } catch (err) {
    console.error('Unexpected error restoring session:', err);
    return null;
  }
};

// ✅ Auth state listener (fires on login/logout/token refresh)
supabase.auth.onAuthStateChange((event, session) => {
  switch (event) {
    case 'SIGNED_IN':
      console.log('✅ User signed in:', session?.user?.email);
      break;
    case 'SIGNED_OUT':
      console.log('👋 User signed out');
      break;
    case 'TOKEN_REFRESHED':
      console.log('🔄 Session token refreshed');
      break;
    case 'USER_UPDATED':
      console.log('✏️ User updated');
      break;
    default:
      console.log(`ℹ️ Auth event: ${event}`);
      break;
  }
});
