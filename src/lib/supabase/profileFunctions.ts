import { supabase } from './client';
import * as FileSystem from 'expo-file-system/legacy';

export interface CustomerProfile {
  id: string; // UUID
  email?: string | null;
  display_name?: string | null;
  username?: string | null;
  contact_number?: string | null;
  push_token?: string | null;
  profile_image_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: any;
}

// Change user password
export async function changePassword(newPassword: string): Promise<ApiResponse> {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      console.error('Error changing password:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    console.error('Unexpected error changing password:', err);
    return { success: false, error: err };
  }
}

// Get profile by user ID
export async function getProfileById(id: string): Promise<ApiResponse<CustomerProfile>> {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      console.error('Error fetching profile by ID:', error);
      return { success: false, error };
    }

    if (!data) {
      return { success: false, error: { message: 'Profile not found' } };
    }

    return { success: true, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    console.error('Unexpected error fetching profile by ID:', err);
    return { success: false, error: err };
  }
}

export interface Notification {
  id: string;
  user_id: string;
  header: string;
  description: string;
  status: 'upcoming' | 'approved' | 'declined';
  type: 'appointment' | 'general' | 'system';
  created_at: string;
}

// Fetch notifications for the current user
export async function fetchNotifications(): Promise<ApiResponse<Notification[]>> {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching notifications:', err);
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    return { success: false, error: err };
  }
}

// Get profile by username
export async function getProfileByUsername(username: string): Promise<ApiResponse<CustomerProfile>> {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      console.error('Error fetching profile by username:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    console.error('Unexpected error fetching profile by username:', err);
    return { success: false, error: err };
  }
}

// Insert new profile
export async function insertProfile(profile: CustomerProfile): Promise<ApiResponse> {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .insert([profile]);

    if (error) {
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      console.error('Error inserting profile:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    console.error('Unexpected error inserting profile:', err);
    return { success: false, error: err };
  }
}

// Upsert profile (insert or update if exists)
export async function upsertProfile(profile: CustomerProfile): Promise<ApiResponse> {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .upsert([profile]);

    if (error) {
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      console.error('Error upserting profile:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    console.error('Unexpected error upserting profile:', err);
    return { success: false, error: err };
  }
}

// Update profile by ID
export async function updateProfile(id: string, profile: Partial<CustomerProfile>): Promise<ApiResponse> {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .update(profile)
      .eq('id', id);

    if (error) {
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      console.error('Error updating profile:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    console.error('Unexpected error updating profile:', err);
    return { success: false, error: err };
  }
}

// Check username availability
export async function checkUsernameAvailability(username: string): Promise<ApiResponse<{ available: boolean }>> {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('username')
      .eq('username', username)
      .limit(1);

    if (error) {
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      console.error('Error checking username availability:', error);
      return { success: false, error };
    }

    const available = data.length === 0;
    return { success: true, data: { available } };
  } catch (err) {
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    console.error('Unexpected error checking username availability:', err);
    return { success: false, error: err };
  }
}

// Delete profile by ID
export async function deleteProfile(id: string): Promise<ApiResponse> {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      console.error('Error deleting profile:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    console.error('Unexpected error deleting profile:', err);
    return { success: false, error: err };
  }
}

// Get all customer profiles
export async function getAllCustomerProfiles(): Promise<ApiResponse<CustomerProfile[]>> {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all customer profiles:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching all customer profiles:', err);
    return { success: false, error: err };
  }
}

// Send OTP to email
export async function sendOTP(email: string): Promise<ApiResponse> {
  try {
    console.log('Sending OTP to email:', email);
    const { data, error } = await supabase.functions.invoke('generate-otp', {
      body: { email },
    });

    if (error) {
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      console.error('Error sending OTP:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    console.error('Unexpected error sending OTP:', err);
    return { success: false, error: err };
  }
}

// Verify OTP
export async function verifyOTP(email: string, otp: string): Promise<ApiResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { email, otp },
    });

    if (error) {
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      console.error('Error verifying OTP:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    console.error('Unexpected error verifying OTP:', err);
    return { success: false, error: err };
  }
}

// Helper function to delete old profile image
async function deleteOldProfileImage(imageUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const urlParts = imageUrl.split('/customer_profileImage/');
    if (urlParts.length < 2) return;
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from('customer_profileImage')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting old profile image:', error);
    }
  } catch (err) {
    console.error('Unexpected error deleting old profile image:', err);
  }
}

// Helper function to convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Upload profile image to Supabase storage
export async function uploadProfileImage(userId: string, imageUri: string): Promise<ApiResponse<string>> {
  try {
    // Get current profile to check for existing image
    const profileResult = await getProfileById(userId);
    
    // Delete old image if exists
    if (profileResult.success && profileResult.data?.profile_image_url) {
      await deleteOldProfileImage(profileResult.data.profile_image_url);
    }

    // Create a unique file name
    const fileName = `${userId}/profile-${Date.now()}.jpg`;

    // Read the file as base64 using Expo FileSystem
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    // Convert base64 to Uint8Array
    const uint8Array = base64ToUint8Array(base64);

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('customer_profileImage')
      .upload(fileName, uint8Array, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Error uploading image:', error);
      return { success: false, error };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('customer_profileImage')
      .getPublicUrl(fileName);

    // Update profile with image URL
    const updateResult = await updateProfile(userId, { profile_image_url: publicUrl });

    if (!updateResult.success) {
      console.error('Error updating profile with image URL:', updateResult.error);
      return { success: false, error: updateResult.error };
    }

    return { success: true, data: publicUrl };
  } catch (err) {
    console.error('Unexpected error uploading profile image:', err);
    return { success: false, error: err };
  }
}