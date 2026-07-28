DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
     AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'check-expirations-daily') THEN
      PERFORM cron.schedule(
        'check-expirations-daily',
        '0 8 * * *',
        $cmd$
          SELECT net.http_post(
            url := 'https://knjopolkcgluitgfukxx.supabase.co/functions/v1/check-expirations',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtuam9wb2xrY2dsdWl0Z2Z1a3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODQ3NDQsImV4cCI6MjA4OTM2MDc0NH0.-ZiiqGn718UYntNKloPpv1inc3HkZgUbrovyZi7FYe8'
            ),
            body := '{}'::jsonb
          );
        $cmd$
      );
    END IF;
  END IF;
END $$;
