-- Add telefone column to usuarios if it doesn't exist
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Update the handle_new_user trigger to include telefone from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.usuarios (id, email, nome, perfil, telefone)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'perfil', 'colaborador'),
    new.raw_user_meta_data->>'telefone'
  );
  RETURN new;
END;
$function$;

-- Create a BEFORE INSERT trigger on auth.users to prevent NULL tokens causing issues
CREATE OR REPLACE FUNCTION public.fix_auth_users_nulls()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.confirmation_token IS NULL THEN NEW.confirmation_token := ''; END IF;
  IF NEW.recovery_token IS NULL THEN NEW.recovery_token := ''; END IF;
  IF NEW.email_change_token_new IS NULL THEN NEW.email_change_token_new := ''; END IF;
  IF NEW.email_change IS NULL THEN NEW.email_change := ''; END IF;
  IF NEW.email_change_token_current IS NULL THEN NEW.email_change_token_current := ''; END IF;
  IF NEW.phone_change IS NULL THEN NEW.phone_change := ''; END IF;
  IF NEW.phone_change_token IS NULL THEN NEW.phone_change_token := ''; END IF;
  IF NEW.reauthentication_token IS NULL THEN NEW.reauthentication_token := ''; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_fix_nulls ON auth.users;
CREATE TRIGGER on_auth_user_created_fix_nulls
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.fix_auth_users_nulls();

-- Fix existing rows with NULLs in auth.users
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL OR recovery_token IS NULL
  OR email_change_token_new IS NULL OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;
