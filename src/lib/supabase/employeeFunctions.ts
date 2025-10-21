import { supabase } from './client';

export interface Employee {
  id: string;
  full_name: string;
  expertise: string;
  work_sched: string[]; // Assuming it's an array of days, e.g., ['Monday', 'Tuesday']
  photo: string;
}

// Get employee by ID
export async function getEmployeeById(id: string): Promise<{ success: boolean; data?: Employee; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('Add_Employee')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching employee by ID:', error);
      return { success: false, error };
    }

    // If photo exists, get the public URL from storage
    if (data.photo) {
      const { data: photoUrl } = supabase.storage
        .from('barbers_bucket')
        .getPublicUrl(data.photo);
      data.photo = photoUrl.publicUrl;
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching employee by ID:', err);
    return { success: false, error: err };
  }
}

// Get all employees
export async function getAllEmployees(): Promise<{ success: boolean; data?: Employee[]; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('Add_Employee')
      .select('*');

    if (error) {
      console.error('Error fetching all employees:', error);
      return { success: false, error };
    }

    // Process photos for each employee
    const processedData = data.map(employee => {
      if (employee.photo) {
        const { data: photoUrl } = supabase.storage
          .from('barbers_bucket')
          .getPublicUrl(employee.photo);
        employee.photo = photoUrl.publicUrl;
      }
      return employee;
    });

    return { success: true, data: processedData };
  } catch (err) {
    console.error('Unexpected error fetching all employees:', err);
    return { success: false, error: err };
  }
}
