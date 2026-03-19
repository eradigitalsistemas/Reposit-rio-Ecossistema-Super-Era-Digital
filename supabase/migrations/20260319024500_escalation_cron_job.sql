-- Habilita a extensão pg_net se não existir (para chamadas HTTP)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Habilita a extensão pg_cron se não existir (para agendamento de tarefas)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
  -- Remove o agendamento anterior se ele já existir para evitar duplicidade
  PERFORM cron.unschedule('update_demand_priority_daily');
EXCEPTION WHEN OTHERS THEN
  -- Ignora se não existir
END $$;

-- Cria a cron job para rodar diariamente à meia-noite
SELECT cron.schedule(
  'update_demand_priority_daily',
  '0 0 * * *',
  $$
  SELECT net.http_post(
      url:='https://fyiukfacrniwpzchpzpx.supabase.co/functions/v1/update-demand-priority',
      headers:='{"Content-Type": "application/json", "x-cron-secret": "super-secret-cron-key-123"}'::jsonb,
      body:='{}'::jsonb
  ) as request_id;
  $$
);
