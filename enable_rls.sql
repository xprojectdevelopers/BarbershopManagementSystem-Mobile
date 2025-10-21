-- Enable Row Level Security on Add_Employee table
ALTER TABLE "Add_Employee" ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all users to read from Add_Employee
CREATE POLICY "Allow all users to read employees" ON "Add_Employee"
FOR SELECT USING (true);
