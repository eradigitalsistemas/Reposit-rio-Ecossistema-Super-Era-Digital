ALTER TABLE public.protocolos_certificados DROP CONSTRAINT IF EXISTS protocolos_certificados_tipo_check;
ALTER TABLE public.protocolos_certificados ADD CONSTRAINT protocolos_certificados_tipo_check CHECK (tipo = ANY (ARRAY['PF'::text, 'PJ'::text, 'SafeID - 4 meses'::text, 'SafeID - 3 anos'::text]));
