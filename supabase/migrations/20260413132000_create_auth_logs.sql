CREATE TABLE IF NOT EXISTS public.auth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT,
    email TEXT,
    event_type TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_logs_admin_select" ON public.auth_logs;
CREATE POLICY "auth_logs_admin_select" ON public.auth_logs
    FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "auth_logs_insert" ON public.auth_logs;
CREATE POLICY "auth_logs_insert" ON public.auth_logs
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_auth_logs_email ON public.auth_logs (email);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON public.auth_logs (created_at);
