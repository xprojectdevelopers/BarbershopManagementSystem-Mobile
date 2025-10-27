-- Enable RLS on notification_loader table
ALTER TABLE notification_loader ENABLE ROW LEVEL SECURITY;

-- Create policy for users to insert their own notifications
CREATE POLICY "Users can insert their own notifications" ON notification_loader
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications" ON notification_loader
FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to update their own notifications
CREATE POLICY "Users can update their own notifications" ON notification_loader
FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON notification_loader
FOR DELETE USING (auth.uid() = user_id);
