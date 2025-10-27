-- Create the email_verify_otps table
CREATE TABLE IF NOT EXISTS email_verify_otps (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verify_otps_email ON email_verify_otps(email);

-- Create an index on expires_at for cleanup
CREATE INDEX IF NOT EXISTS idx_email_verify_otps_expires_at ON email_verify_otps(expires_at);

-- Enable RLS
ALTER TABLE email_verify_otps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts and selects for service role (for functions)
CREATE POLICY "Allow service role access" ON email_verify_otps
  FOR ALL USING (auth.role() = 'service_role');
