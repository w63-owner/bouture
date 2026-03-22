-- =============================================================================
-- Push notification webhook: triggers Edge Function on new messages via pg_net
-- =============================================================================

-- pg_net is pre-installed on Supabase, enables async HTTP from Postgres
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ---------------------------------------------------------------------------
-- Trigger function: fires an async HTTP POST to the push-notify Edge Function
-- with the new message record. pg_net is non-blocking — the INSERT returns
-- immediately and the HTTP call happens in the background.
--
-- The anon key is hardcoded here because it is public (embedded in the
-- frontend JS). Vault INSERT is not available from migrations on hosted
-- Supabase due to pgsodium permission restrictions.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_message_push_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZXFhaWZjbGNjbmtzcnJyYm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMjU4MTUsImV4cCI6MjA4OTYwMTgxNX0.lCQYVNZZzYEN10rPY41xU1QtkVatVs1PfOQdYmyLPvE';
  _payload  jsonb;
  _url      text := 'https://ypeqaifclccnksrrrboo.supabase.co/functions/v1/push-notify';
BEGIN
  _payload := jsonb_build_object(
    'type',   TG_OP,
    'table',  TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', jsonb_build_object(
      'id',              NEW.id,
      'conversation_id', NEW.conversation_id,
      'sender_id',       NEW.sender_id,
      'content',         NEW.content,
      'type',            NEW.type::text,
      'image_url',       NEW.image_url
    )
  );

  PERFORM net.http_post(
    url     := _url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || _anon_key
    ),
    body    := _payload
  );

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Trigger: fires AFTER INSERT on messages (one call per new row)
-- ---------------------------------------------------------------------------
CREATE TRIGGER on_new_message_push_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message_push_notify();
