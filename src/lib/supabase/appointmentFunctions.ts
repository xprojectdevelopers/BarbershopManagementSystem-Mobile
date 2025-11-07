import { supabase } from './client'

export async function getAppointmentsForUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('No authenticated user found')
      return { success: false, error: 'No authenticated user' }
    }

    const { data, error } = await supabase
      .from('appointment_sched')
      .select('*, service_id(*)')
      .eq('customer_id', user.id)
      .order('sched_date', { ascending: false })

    if (error) {
      console.error('Error fetching appointments:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    console.error('Unexpected error fetching appointments:', err)
    return { success: false, error: err }
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('appointment_sched')
      .update({ status })
      .eq('id', appointmentId);

    if (error) {
      console.error('Error updating appointment status:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error updating appointment status:', err);
    return { success: false, error: err };
  }
}