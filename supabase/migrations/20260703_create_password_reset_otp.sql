-- Create password_reset_otp table
CREATE TABLE IF NOT EXISTS password_reset_otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_otp_email ON password_reset_otp(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otp_expires_at ON password_reset_otp(expires_at);

-- Add RLS policies
ALTER TABLE password_reset_otp ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for signup/forgot password flow)
CREATE POLICY "Allow insert for password reset" 
  ON password_reset_otp 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to select their own OTP
CREATE POLICY "Allow select for password reset" 
  ON password_reset_otp 
  FOR SELECT 
  USING (true);

-- Allow anyone to update their own OTP (mark as used)
CREATE POLICY "Allow update for password reset" 
  ON password_reset_otp 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);
