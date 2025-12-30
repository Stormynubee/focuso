-- Enable realtime for couple_connections table (if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'couple_connections'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_connections;
  END IF;
END $$;