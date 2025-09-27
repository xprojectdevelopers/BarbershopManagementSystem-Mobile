import { supabase } from './client';

export interface CustomerProfile {
  id: string; // UUID
  email?: string | null;
  display_name?: string | null;
  username?: string | null;
  contact_number?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Get profile by user ID
export async function getProfileById(id: string) {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching profile by ID:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching profile by ID:', err);
    return { success: false, error: err };
  }
}

// Get profile by username
export async function getProfileByUsername(username: string) {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Error fetching profile by username:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
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
      console.error('Error inserting profile:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
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
      console.error('Error updating profile:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
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
      console.error('Error checking username availability:', error);
      return { success: false, error };
    }

    const available = data.length === 0;
    return { success: true, available };
  } catch (err) {
    console.error('Unexpected error checking username availability:', err);
    return { success: false, error: err };
  }
}


