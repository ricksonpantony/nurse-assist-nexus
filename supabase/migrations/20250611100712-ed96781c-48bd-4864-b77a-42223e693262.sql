
-- First, let's check if there are any remaining triggers on user_profiles
DROP TRIGGER IF EXISTS audit_trigger ON public.user_profiles;
DROP TRIGGER IF EXISTS update_user_profiles_trigger ON public.user_profiles;
DROP TRIGGER IF EXISTS audit_log_trigger ON public.user_profiles;

-- Remove any functions that might be referencing a status field
DROP FUNCTION IF EXISTS public.audit_user_profiles() CASCADE;
DROP FUNCTION IF EXISTS public.log_user_profiles_changes() CASCADE;

-- Ensure the user_profiles table has the correct structure
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS status;

-- Make sure the table has all required columns with proper types
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create a simple update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add the update trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
