-- Migration: create trigger + function to call Edge Function on new user signup
-- Proper trigger wrapper around supabase_functions.http_request

create or replace function public.notify_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  perform supabase_functions.http_request(
    'https://qsqihdpfhfzcrwhkxgxu.supabase.co/functions/v1/send-user-data',
    'POST',
    '{"Content-Type": "application/json"}'::jsonb,
    jsonb_build_object('record', to_jsonb(NEW))
  );
  return NEW;
end;
$$;

drop trigger if exists on_new_user on auth.users;
create trigger on_new_user
  after insert on auth.users
  for each row execute function public.notify_new_user();
