import { supabase } from './client';

export interface BadgeTracker {
  id: string;
  userId: string;
  completed_count: number;
  badge_name: string;
  updated_at: string;
}

// Fetch badge for a user
export async function getUserBadge(userId: string): Promise<{ success: boolean; data?: BadgeTracker; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('badge_tracker')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned, user has no badge
        return { success: true, data: { id: '', userId: userId, completed_count: 0, badge_name: 'None', updated_at: '' } };
      }
      console.error('Error fetching user badge:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching user badge:', err);
    return { success: false, error: err };
  }
}

// Update badge for a user (this will be handled by the trigger, but keeping for manual updates if needed)
export async function updateUserBadge(userId: string, completedCount: number, badgeName: string): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('badge_tracker')
      .upsert([
        {
          user_id: userId,
          completed_count: completedCount,
          badge_name: badgeName,
        },
      ]);

    if (error) {
      console.error('Error updating user badge:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error updating user badge:', err);
    return { success: false, error: err };
  }
}
