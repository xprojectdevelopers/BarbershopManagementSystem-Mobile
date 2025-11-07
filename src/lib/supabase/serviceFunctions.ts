import { supabase } from './client';

export interface Service {
  id: string;
  Emp_ID: string;
  Barber_Nickname: string;
  Service: string;
  Price: string;
}

// Get services by barber nickname
export async function getServicesByBarberNickname(barberNickname: string): Promise<{ success: boolean; data?: Service[]; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('AssignNew_Service')
      .select('*')
      .eq('Barber_Nickname', barberNickname);

    if (error) {
      console.error('Error fetching services by barber nickname:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching services by barber nickname:', err);
    return { success: false, error: err };
  }
}
// Get service by ID
export async function getServiceById(id: string): Promise<{ success: boolean; data?: Service; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('AssignNew_Service')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching service by ID:', error);
      return { success: false, error };
    }

    if (!data) {
      console.error('No service found with ID:', id);
      return { success: false, error: { message: 'Service not found' } };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching service by ID:', err);
    return { success: false, error: err };
  }
}
