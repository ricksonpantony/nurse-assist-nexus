
-- First, let's check if the audit trigger is attached to user_profiles table
-- and create it if it doesn't exist
DROP TRIGGER IF EXISTS audit_trigger ON public.user_profiles;

-- Create the audit trigger for user_profiles table
CREATE TRIGGER audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Also ensure the updated trigger function is in place
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  current_user_email TEXT;
  severity_level TEXT := 'medium';
BEGIN
  -- Get current user email
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  -- Handle different operations
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id, user_email, action, table_name, record_id, 
      old_values, new_values, ip_address, user_agent, severity
    ) VALUES (
      auth.uid(), 
      COALESCE(current_user_email, 'system@example.com'),
      'INSERT',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      NULL,
      to_jsonb(NEW),
      '127.0.0.1',
      'System',
      'medium'
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Determine severity based on table and changes
    IF TG_TABLE_NAME = 'payments' THEN
      severity_level := 'high';
    ELSIF TG_TABLE_NAME = 'students' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
      severity_level := 'medium';
    ELSIF TG_TABLE_NAME = 'user_profiles' THEN
      severity_level := 'low';
    ELSE
      severity_level := 'low';
    END IF;

    INSERT INTO public.audit_logs (
      user_id, user_email, action, table_name, record_id,
      old_values, new_values, ip_address, user_agent, severity
    ) VALUES (
      auth.uid(),
      COALESCE(current_user_email, 'system@example.com'),
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW),
      '127.0.0.1',
      'System',
      severity_level
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id, user_email, action, table_name, record_id,
      old_values, new_values, ip_address, user_agent, severity
    ) VALUES (
      auth.uid(),
      COALESCE(current_user_email, 'system@example.com'),
      'DELETE',
      TG_TABLE_NAME,
      OLD.id::TEXT,
      to_jsonb(OLD),
      NULL,
      '127.0.0.1',
      'System',
      'critical'
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
