import { supabase } from './client';

export interface CustomerProfile {
  id: string; // UUID
  email?: string | null;
  display_name?: string | null;
  username?: string | null;
  contact_number?: string | null;
  push_token?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Change user password
export async function changePassword(newPassword: string) {
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
export async function getProfileById(id: string) {
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
export async function fetchNotifications() {
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
export async function getProfileByUsername(username: string): Promise<{ success: boolean; data?: CustomerProfile; error?: any }> {
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
export async function insertProfile(profile: CustomerProfile) {
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

// Update profile by ID
export async function updateProfile(id: string, profile: Partial<CustomerProfile>) {
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
export async function checkUsernameAvailability(username: string) {
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
    return { success: true, available };
  } catch (err) {
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    console.error('Unexpected error checking username availability:', err);
    return { success: false, error: err };
  }
}

// Delete profile by ID
export async function deleteProfile(id: string) {
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

// Send OTP to email
export async function sendOTP(email: string) {
  try {
    console.log('Sending OTP to email:', email);
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to: email },
    });

    if (error) {
      console.error('Error sending OTP:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error sending OTP:', err);
    return { success: false, error: err };
  }
}

// Verify OTP
export async function verifyOTP(email: string, otp: string) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-otp', {
      body: { email, otp },
    });

    if (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error verifying OTP:', err);
    return { success: false, error: err };
  }
}




