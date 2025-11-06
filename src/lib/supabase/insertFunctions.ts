import { supabase } from './client'
import { getProfileById } from './profileFunctions'

interface InsertData {
  barber_id?: string
  service_id?: string
  sched_date?: string | null
  sched_time?: string | null
  customer_name?: string | null
  contact_number?: string | null
  customer_badge?: string | null
  subtotal?: number | null
  appointment_fee?: number | null
  total?: number | null
  status?: string | null
  receipt_code?: string
  payment_method?: string | null
  push_token?: string | null
  payment_status?: string | null
}

const generateReceiptCode = async () => {
  try {
    // Query the database for the highest receipt_code starting with 'MSB-'
    const { data, error } = await supabase
      .from('appointment_sched')
      .select('receipt_code')
      .like('receipt_code', 'MSB-%')
      .order('receipt_code', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching max receipt_code:', error);
      // Fallback to timestamp-based code if query fails
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 100);
      return `MSB${timestamp}${random.toString().padStart(2, '0')}`;
    }

    let nextNumber = 1; // Default if no existing codes

    if (data && data.length > 0) {
      const maxCode = data[0].receipt_code;
      // Extract the number part after 'MSB-'
      const numberPart = maxCode.split('-')[1];
      if (numberPart) {
        const currentNumber = parseInt(numberPart, 10);
        if (!isNaN(currentNumber)) {
          nextNumber = currentNumber + 1;
        }
      }
    }

    // Format as MSB-XXXX (4-digit padded)
    return `MSB-${nextNumber.toString().padStart(4, '0')}`;
  } catch (err) {
    console.error('Unexpected error generating receipt code:', err);
    // Fallback
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100);
    return `MSB${timestamp}${random.toString().padStart(2, '0')}`;
  }
};

export async function insertDropdownSelection(data: InsertData) {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('No authenticated user found')
      return { success: false, error: 'No authenticated user' }
    }

    const receiptCode = await generateReceiptCode();

    // Get profile data from customer_profiles
    const profileResult = await getProfileById(user.id);
    if (!profileResult.success) {
      console.error('Failed to fetch customer profile');
      return { success: false, error: 'Failed to fetch customer profile' };
    }
    const profile = profileResult.data;
    const pushToken = profile?.push_token ?? null;
    const customerName = profile?.display_name ?? profile?.username ?? null;
    const contactNumber = profile?.contact_number ?? null;

    // Get user badge
    const { getUserBadge } = await import('./badgeFunctions');
    const badgeResult = await getUserBadge(user.id);
    const customerBadge = badgeResult.success ? badgeResult.data?.badge_name ?? 'None' : 'None';

    const { data: insertedData, error } = await supabase
      .from('appointment_sched')
      .insert([
        {
          customer_id: user.id,
          barber_id: data.barber_id ?? null,
          service_id: data.service_id ?? null,
          sched_date: data.sched_date ?? null,
          sched_time: data.sched_time ?? null,
          customer_name: customerName,
          contact_number: contactNumber,
          customer_badge: customerBadge,
          subtotal: data.subtotal ?? null,
          appointment_fee: data.appointment_fee ?? null,
          total: data.total ?? null,
          status: data.status ?? 'On Going',
          receipt_code: receiptCode,
          payment_method: data.payment_method ?? null,
          push_token: pushToken,
          payment_status: data.payment_status ?? 'Unpaid',
        },
      ])
      .select('id')

    if (error) {
      console.error('Error inserting dropdown selection:', error)
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      return { success: false, error }
    }

    // Send push notification using optimized Supabase function
    if (pushToken) {
      const notificationStartTime = Date.now();
      console.log('📱 Sending appointment notification...');
      
      try {
        const notificationResult = await supabase.functions.invoke('sendNotification', {
          body: {
            expoPushToken: pushToken,
            title: 'Appointment Booked',
            message: 'Your appointment has been successfully booked.',
            data: { type: 'appointment_booked', appointment_id: insertedData?.[0]?.id },
          },
        });

        const notificationTime = Date.now() - notificationStartTime;
        console.log(`✅ Notification sent in ${notificationTime}ms`);
        
        if (notificationResult.data?.timing) {
          console.log('📊 Server timing:', notificationResult.data.timing);
        }
      } catch (notificationError) {
        console.error('❌ Failed to send push notification:', notificationError);
        // Don't fail the entire booking if notification fails
      }
    } else {
      console.warn('⚠️ No push token available for user');
    }

    return { success: true, data: insertedData }
  } catch (err) {
    console.error('Unexpected error inserting dropdown selection:', err)
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    return { success: false, error: err }
  }
}

// Insert notification
export async function insertNotification(header: string, description: string, status: string = 'upcoming', type: string = 'general') {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: user.id,
          header,
          description,
          status,
          type,
        },
      ]);

    if (error) {
      console.error('Error inserting notification:', error);
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error inserting notification:', err);
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    return { success: false, error: err };
  }
}

// Insert notification loader
export async function insertNotificationLoader(title: string, description?: string, receipt_id?: string) {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }

    const { data, error } = await supabase
      .from('notification_loader')
      .insert([
        {
          user_id: user.id,
          title,
          description,
          receipt_id,
          read: false,
        },
      ]);

    if (error) {
      console.error('Error inserting notification loader:', error);
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error inserting notification loader:', err);
    if (err instanceof Error && err.message.includes('AuthSessionMissingError')) {
      err.message = 'Auth session cleared';
    }
    return { success: false, error: err };
  }
}
