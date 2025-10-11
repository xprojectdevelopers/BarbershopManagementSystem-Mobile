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
          status: data.status ?? 'pending',
          receipt_code: receiptCode,
          payment_method: data.payment_method ?? null,
        },
      ])

    if (error) {
      console.error('Error inserting dropdown selection:', error)
      if (error.message && error.message.includes('AuthSessionMissingError')) {
        error.message = 'Auth session cleared';
      }
      return { success: false, error }
    }

    // Send push notification
    const profileResult = await getProfileById(user.id);
    if (profileResult.success && profileResult.data?.push_token) {
      try {
        await supabase.functions.invoke('sendNotification', {
          body: {
            expoPushToken: profileResult.data.push_token,
            title: 'Appointment Booked',
            body: 'Your appointment has been successfully booked.',
          },
        });
      } catch (notificationError) {
        console.error('Failed to send push notification:', notificationError);
        // Continue - appointment was successfully created
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
