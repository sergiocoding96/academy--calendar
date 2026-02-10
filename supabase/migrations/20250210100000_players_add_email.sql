-- Add email column to players if it doesn't exist (schema cache / older schema had contact_email only)
ALTER TABLE players ADD COLUMN IF NOT EXISTS email TEXT;
