import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signOut: () => Promise<any>;
  refreshSession: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  // --- 🧹 Cleans stale Supabase auth data ---
  const cleanupStaleAuthData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const supabaseKeys = keys.filter(k => k.includes('supabase'));
      if (supabaseKeys.length) {
        await AsyncStorage.multiRemove(supabaseKeys);
        console.log(`🧹 Removed ${supabaseKeys.length} stale Supabase keys`);
      }
    } catch (error) {
      console.error('Error cleaning up auth data:', error);
    }
  };

  // --- 🔁 Restore session on app load ---
  const restoreSession = async () => {
    try {
      // Wait for AsyncStorage hydration
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.log('getSession error:', error.message);
        if (error.message.includes('Auth session missing')) {
          await cleanupStaleAuthData();
        }
        setUser(null);
        return;
      }

      if (data?.session) {
        console.log('✅ Restored session for:', data.session.user.email);
        setUser(data.session.user);
      } else {
        console.log('⚠️ No saved session found');
        setUser(null);
      }
    } catch (err) {
      console.error('Unexpected restoreSession error:', err);
      setUser(null);
    } finally {
      setReady(true);
      setLoading(false);
    }
  };

  // --- 🔄 Manual session refresh ---
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Refresh session error:', error.message);
        if (error.message.includes('Auth session missing')) {
          await cleanupStaleAuthData();
        }
        return { data: null, error };
      }
      setUser(data?.session?.user || null);
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected refresh error:', err);
      return { data: null, error: err };
    }
  };

  // --- 🧠 Initialize session on app start ---
  useEffect(() => {
    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        console.log('Auth event:', _event, '→ user:', session.user.email);
        setUser(session.user);
      } else {
        console.log('Auth event:', _event, '→ no session');
        setUser(null);
      }
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // --- 🔐 Sign up ---
  const signUp = async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    });
    if (error) console.error('Sign-up error:', error.message);
    return { data, error };
  };

  // --- 🔓 Sign in ---
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.error('Sign-in error:', error.message);
    return { data, error };
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign-out error:', error.message);
    await cleanupStaleAuthData();
    setUser(null);
  };

  const value = { user, loading: !ready || loading, signIn, signUp, signOut, refreshSession };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
