import { useState } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase/client';
import { getProfileById, insertProfile } from '../lib/supabase/profileFunctions';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async (): Promise<{ success: boolean; data?: { user?: any }; error?: any }> => {
    setLoading(true);
    try {
      const redirectUrl = makeRedirectUri({
        scheme: 'com.fr4nc.mlvst',
        path: 'auth/callback',
      });

      console.log('Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No authentication URL received');

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === 'success') {
        const url = new URL(result.url);
        
        // Check for errors first
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const queryParams = new URLSearchParams(url.search);
        
        const error = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
        
        if (error) {
          console.error('OAuth Error:', error);
          console.error('Description:', decodeURIComponent(errorDescription || ''));
          
          // Return user-friendly error message
          if (errorDescription?.includes('exchange external code')) {
            return { 
              success: false, 
              error: new Error('Google authentication setup error. Please contact support.') 
            };
          }
          return { success: false, error: new Error(errorDescription || error) };
        }

        // Try to get tokens
        let access_token = hashParams.get('access_token') || queryParams.get('access_token');
        let refresh_token = hashParams.get('refresh_token') || queryParams.get('refresh_token');

        if (access_token && refresh_token) {
          // Retry logic for setSession to handle AuthRetryableFetchError
          let sessionData, sessionError;
          const maxRetries = 3;
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const result = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            sessionData = result.data;
            sessionError = result.error;

            if (!sessionError || !sessionError.message.includes('AuthRetryableFetchError')) {
              break;
            }

            if (attempt < maxRetries) {
              console.warn(`setSession attempt ${attempt} failed with AuthRetryableFetchError, retrying...`);
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
            }
          }

          if (sessionError) throw sessionError;

          if (!sessionData) throw new Error('Session data is undefined');

          const user = sessionData.session?.user;
          if (user) {
            // Check if profile exists
            const { success: profileSuccess } = await getProfileById(user.id);
            if (!profileSuccess) {
              // Register for push notifications
              let pushToken = null;
              try {
                const { registerForPushNotificationsAsync } = await import('../utils/registerForPushNotificationAsync');
                pushToken = await registerForPushNotificationsAsync();
              } catch (error) {
                console.warn('⚠️ No push token available for user:', error);
              }

              const profile = {
                id: user.id,
                email: user.email,
                display_name: user.user_metadata?.full_name || user.email,
                contact_number: null,
                push_token: pushToken,
                profile_image_url: user.user_metadata?.picture || null,
              };
              await insertProfile(profile);
            }
          }

          return { success: true, data: { user } };
        } else {
          console.error('Full URL:', result.url);
          return { success: false, error: new Error('No access token received') };
        }
      } else if (result.type === 'cancel') {
        return { success: false, error: new Error('cancelled') };
      } else {
        return { success: false, error: new Error('Authentication failed') };
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading };
};