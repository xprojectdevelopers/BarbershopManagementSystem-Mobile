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
}

const generateReceiptCode = async () => {
  const { data: maxCodeData } = await supabase
    .from('appointment_sched')
    .select('receipt_code')
    .order('receipt_code', { ascending: false })
    .limit(1);

  let nextNumber = 1;
  if (maxCodeData && maxCodeData.length > 0) {
    const maxCode = maxCodeData[0].receipt_code;
    const number = parseInt(maxCode.replace('MSB-', ''));
    nextNumber = number + 1;
  }
  return `MSB-${nextNumber.toString().padStart(4, '0')}`;
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

    // Get push token from customer_profiles
    const profileResult = await getProfileById(user.id);
    const pushToken = profileResult.success ? profileResult.data?.push_token : null;

    const { data: insertedData, error } = await supabase
      .from('appointment_sched')
      .insert([
        {
          customer_id: user.id,
          barber_id: data.barber_id ?? null,
          service_id: data.service_id ?? null,
          sched_date: data.sched_date ?? null,
          sched_time: data.sched_time ?? null,
          customer_name: data.customer_name ?? null,
          contact_number: data.contact_number ?? null,
          customer_badge: data.customer_badge ?? null,
          subtotal: data.subtotal ?? null,
          appointment_fee: data.appointment_fee ?? null,
          total: data.total ?? null,
          status: data.status ?? 'On Going',
          receipt_code: receiptCode,
          payment_method: data.payment_method ?? null,
          push_token: pushToken,
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

    // Send push notification using Supabase function
    if (pushToken) {
      try {
        await supabase.functions.invoke('sendNotification', {
          body: {
            expoPushToken: pushToken,
            title: 'Appointment Booked',
            message: 'Your appointment has been successfully booked.',
            data: { type: 'appointment_booked', appointment_id: insertedData?.[0]?.id },
          },
        });
      } catch (notificationError) {
        console.error('Failed to send push notification:', notificationError);
      }
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
