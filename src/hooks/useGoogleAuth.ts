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
        path: '/auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      const result = await WebBrowser.openAuthSessionAsync(
        data?.url!,
        redirectUrl
      );

      if (result.type === 'success') {
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.substring(1));

        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token!,
          });
          if (sessionError) throw sessionError;

          const user = sessionData.session?.user;
          if (user) {
            // Check if profile exists
            const { success: profileSuccess } = await getProfileById(user.id);
            if (!profileSuccess) {
              // Insert profile
              const profile = {
                id: user.id,
                email: user.email,
                display_name: user.user_metadata?.full_name || user.email,
                username: null,
                contact_number: null,
              };
              await insertProfile(profile);
            }
          }

          return { success: true, data: { user } };
        } else {
          return { success: false, error: new Error('No access token received') };
        }
      } else if (result.type === 'cancel') {
        return { success: false, error: new Error('cancelled') };
      } else {
        return { success: false, error: new Error('Authentication failed') };
      }
    } catch (error) {
      console.error('Error:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading };
};