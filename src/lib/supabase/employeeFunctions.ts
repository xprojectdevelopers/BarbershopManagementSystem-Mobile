import { supabase } from './client';

export interface Employee {
  id: string;
  Full_Name: string;
  Employee_Nickname: string;
  Employee_Role: string;
  Barber_Expert: string;
  dayOff: string[];
  Photo: string;
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
    if (data.Photo) {
      const { data: photoUrl } = supabase.storage
        .from('Employee_Profile')
        .getPublicUrl("barbers/" + data.Photo);
      data.photo = photoUrl.publicUrl;
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching employee by ID:', err);
    return { success: false, error: err };
  }
}

// Get employee by nickname
export async function getEmployeeByNickname(nickname: string): Promise<{ success: boolean; data?: Employee; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('Add_Employee')
      .select('*')
      .eq('Employee_Nickname', nickname)
      .maybeSingle();

    if (error) {
      console.error('Error fetching employee by nickname:', error);
      return { success: false, error };
    }

    if (!data) {
      console.error('No employee found with nickname:', nickname);
      return { success: false, error: { message: 'Employee not found' } };
    }

    // If photo exists, get the public URL from storage
    if (data.Photo) {
      const { data: photoUrl } = supabase.storage
        .from('Employee_Profile')
        .getPublicUrl("barbers/" + data.Photo);
      data.photo = photoUrl.publicUrl;
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching employee by nickname:', err);
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
      if (employee.Photo) {
        const { data: photoUrl } = supabase.storage
          .from('Employee_Profile')
          .getPublicUrl("barbers/" + employee.Photo);
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
