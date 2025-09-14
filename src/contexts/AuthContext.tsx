import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces
interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signOut: () => Promise<any>;
  refreshSession: () => Promise<any>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Enhanced cleanup of stale authentication data
  const cleanupStaleAuthData = async () => {
    try {
      console.log('Starting auth data cleanup...');
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(key => key.includes('supabase.auth.token'));
      console.log('Found auth keys:', authKeys);

      let removedCount = 0;

      for (const key of authKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            try {
              const tokenData = JSON.parse(value);

              // Check for various invalid token conditions
              const isExpired = tokenData.expires_at && tokenData.expires_at < Date.now() / 1000;
              const isInvalidRefreshToken = key.includes('refresh_token') && (!tokenData.refresh_token || tokenData.refresh_token === '');
              const isMalformed = !tokenData || typeof tokenData !== 'object';

              if (isExpired || isInvalidRefreshToken || isMalformed) {
                console.log(`Removing invalid token (${isExpired ? 'expired' : isInvalidRefreshToken ? 'invalid refresh' : 'malformed'}):`, key);
                await AsyncStorage.removeItem(key);
                removedCount++;
              }
            } catch (parseError) {
              console.log('Error parsing token data, removing malformed token:', key, parseError);
              await AsyncStorage.removeItem(key);
              removedCount++;
            }
          } else {
            // Remove empty values
            console.log('Removing empty token:', key);
            await AsyncStorage.removeItem(key);
            removedCount++;
          }
        } catch (error) {
          console.log('Error processing token, removing:', key, error);
          await AsyncStorage.removeItem(key);
          removedCount++;
        }
      }

      console.log(`Auth cleanup completed. Removed ${removedCount} invalid tokens.`);

      const sessionKeys = keys.filter(key => key.includes('supabase.auth.session'));
      for (const key of sessionKeys) {
        try {
          await AsyncStorage.removeItem(key);
          console.log('Removed session data:', key);
          removedCount++;
        } catch (error) {
          console.log('Error removing session data:', key, error);
        }
      }

    } catch (error) {
      console.error('Error during auth data cleanup:', error);
    }
  };

  // Enhanced refresh session function with retry logic
  const refreshSession = async (maxRetries = 2, initialDelay = 1000) => {
    let retries = 0;

    const attemptRefresh = async (delay: number): Promise<any> => {
      try {
        console.log(`Attempting to refresh session (attempt ${retries + 1}/${maxRetries + 1})...`);
        const { data: { session }, error } = await supabase.auth.refreshSession();

        if (error) {
          console.error('Session refresh error:', error);

          if (error.message.includes('Invalid Refresh Token')) {
            console.log('Invalid refresh token detected, cleaning up stale data...');
            await cleanupStaleAuthData();

            // If we have retries left, wait and try again
            if (retries < maxRetries) {
              retries++;
              const nextDelay = delay * 2; // Exponential backoff
              console.log(`Waiting ${nextDelay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, nextDelay));
              return attemptRefresh(nextDelay);
            }
          }

          return { data: null, error };
        }

        console.log('Session refreshed successfully');
        setUser(session?.user || null);
        return { data: session, error: null };
      } catch (error) {
        console.error('Unexpected error during session refresh:', error);

        if (retries < maxRetries) {
          retries++;
          const nextDelay = delay * 2;
          console.log(`Unexpected error, waiting ${nextDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, nextDelay));
          return attemptRefresh(nextDelay);
        }

        return { data: null, error };
      }
    };

    return attemptRefresh(initialDelay);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session check error:', error);

          // Handle various auth errors
          if (error.message.includes('Invalid Refresh Token') ||
              error.message.includes('Refresh Token Not Found') ||
              error.message.includes('JWT expired')) {
            console.log('Auth token issue detected, performing comprehensive cleanup...');
            await cleanupStaleAuthData();

            // Try to get session again after cleanup
            try {
              const { data: { session: newSession } } = await supabase.auth.getSession();
              if (newSession) {
                console.log('Session restored after cleanup');
                setUser(newSession.user);
              } else {
                console.log('No valid session after cleanup, user needs to sign in');
                setUser(null);
              }
            } catch (retryError) {
              console.error('Error getting session after cleanup:', retryError);
              setUser(null);
            }
          } else {
            // For other errors, just set user to null
            console.log('Other auth error, setting user to null');
            setUser(null);
          }
        } else {
          console.log('Session found:', session ? 'valid' : 'none');
          setUser(session?.user || null);

          // If we have a session but it might be expiring soon, schedule a refresh
          if (session?.expires_at) {
            const expiresIn = session.expires_at - Math.floor(Date.now() / 1000);
            if (expiresIn < 300) { // Less than 5 minutes remaining
              console.log('Session expiring soon, scheduling refresh...');
              setTimeout(() => {
                refreshSession().catch(err =>
                  console.error('Scheduled refresh failed:', err)
                );
              }, Math.max(expiresIn - 60, 0) * 1000); // Refresh 1 minute before expiry
            }
          }
        }
      } catch (error) {
        console.error('Unexpected session check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Enhanced auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'session exists' : 'no session');

        switch (event) {
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed successfully');
            break;
          case 'SIGNED_OUT':
            console.log('User signed out, performing cleanup...');
            await cleanupStaleAuthData();
            break;
          case 'SIGNED_IN':
            console.log('User signed in successfully');
            break;
          case 'USER_UPDATED':
            console.log('User data updated');
            break;
          default:
            console.log('Unknown auth event:', event);
        }

        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('Signing up user:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: userData }
      });

      if (error) {
        console.error('Sign up error:', error);
      } else {
        console.log('Sign up successful');
      }

      return { data, error };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { data: null, error };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid Refresh Token')) {
          await cleanupStaleAuthData();
          const retryResult = await supabase.auth.signInWithPassword({
            email,
            password
          });
          return retryResult;
        } else if (error.message.includes('Invalid login credentials')) {
          return {
            data: null,
            error: new Error('Invalid email or password. Please try again.')
          };
        } else if (error.message.includes('Email not confirmed')) {
          return {
            data: null,
            error: new Error('Please verify your email before logging in.')
          };
        }

        return { data, error };
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('customer_profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          // User authenticated but no profile found
          // This could happen if profile creation failed during signup
          // We still return success since authentication worked
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log('Signing out user...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('Sign out successful');
        await cleanupStaleAuthData();
      }

      return { error };
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      return { error };
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
