CREATE TABLE IF NOT EXISTS public.parceiros_certificados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.parceiros_certificados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_parceiros_certificados" ON public.parceiros_certificados;
CREATE POLICY "allow_all_parceiros_certificados" ON public.parceiros_certificados
    FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.parceiros_certificados (nome) VALUES
  ('Novos Protocolos'),
  ('Alecyo'),
  ('Diego'),
  ('Edeilson'),
  ('Fábio'),
  ('Júlio'),
  ('J H M Praca'),
  ('Nicassia'),
  ('Rodrigo Autocontas'),
  ('Rodrigo e Lucena'),
  ('Ronaldo'),
  ('Romulo Praca'),
  ('Orlando - Glauciane'),
  ('Valdemar - Lyla'),
  ('Luciana'),
  ('Útil'),
  ('Priscila')
ON CONFLICT (nome) DO NOTHING;
