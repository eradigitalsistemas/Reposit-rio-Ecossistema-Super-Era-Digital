CREATE TABLE IF NOT EXISTS public.cron_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    status TEXT NOT NULL,
    records_processed INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.cron_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_cron_logs" ON public.cron_logs;
CREATE POLICY "auth_read_cron_logs" ON public.cron_logs 
  FOR SELECT TO authenticated USING (true);
