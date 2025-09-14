-- Create the appointment_sched table
CREATE TABLE public.appointment_sched (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES auth.users(id),
    barber_id text,
    service_id text,
    sched_date date,
    sched_time time,
    customer_name text,
    subtotal numeric,
    appointment_fee numeric DEFAULT 10,
    total numeric,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.appointment_sched ENABLE ROW LEVEL SECURITY;

-- Policy: Insert (users can only insert their own appointments)
CREATE POLICY "Users can insert their own appointments"
ON public.appointment_sched
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Policy: Select (users can only view their own appointments)
CREATE POLICY "Users can view their own appointments"
ON public.appointment_sched
FOR SELECT
USING (auth.uid() = customer_id);

-- Policy: Update (users can only update their own appointments)
CREATE POLICY "Users can update their own appointments"
ON public.appointment_sched
FOR UPDATE
USING (auth.uid() = customer_id);

-- Policy: Delete (users can only delete their own appointments)
CREATE POLICY "Users can delete their own appointments"
ON public.appointment_sched
FOR DELETE
USING (auth.uid() = customer_id);
