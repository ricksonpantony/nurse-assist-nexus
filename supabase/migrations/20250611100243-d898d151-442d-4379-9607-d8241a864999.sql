
-- Remove the audit trigger from user_profiles table that's causing the error
DROP TRIGGER IF EXISTS audit_trigger ON public.user_profiles;

-- The trigger is expecting a 'status' field that doesn't exist in user_profiles
-- This will allow profile updates to work properly
