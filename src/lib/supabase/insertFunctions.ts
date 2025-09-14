import { supabase } from './client'

interface InsertData {
  barber_id?: string
  service_id?: string
  sched_date?: string | null
  sched_time?: string | null
  customer_name?: string | null
  subtotal?: number | null
  appointment_fee?: number | null
  total?: number | null
  status?: string | null
}

export async function insertDropdownSelection(data: InsertData) {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('No authenticated user found')
      return { success: false, error: 'No authenticated user' }
    }

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
          subtotal: data.subtotal ?? null,
          appointment_fee: data.appointment_fee ?? null,
          total: data.total ?? null,
          status: data.status ?? 'pending',
        },
      ])

    if (error) {
      console.error('Error inserting dropdown selection:', error)
      return { success: false, error }
    }

    return { success: true, data: insertedData }
  } catch (err) {
    console.error('Unexpected error inserting dropdown selection:', err)
    return { success: false, error: err }
  }
}
