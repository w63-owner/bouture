-- Enable full replica identity so Supabase Realtime sends complete rows on UPDATE events
-- Required for message status updates to propagate in real-time
ALTER TABLE messages REPLICA IDENTITY FULL;
