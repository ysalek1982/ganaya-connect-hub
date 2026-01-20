-- Create triggers for auth.users only if they don't exist

-- Trigger for auto-promote admin on auth.users insert
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_promote_admin') THEN
    CREATE TRIGGER on_auth_user_created_promote_admin
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.auto_promote_admin();
  END IF;
END $$;

-- Trigger for auto-create profile on auth.users insert  
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_profile') THEN
    CREATE TRIGGER on_auth_user_created_profile
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;