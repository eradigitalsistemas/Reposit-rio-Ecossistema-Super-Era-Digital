DO $$
BEGIN
  -- Add new columns for candidates if they don't exist
  ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS observations TEXT DEFAULT '';
  ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS profession TEXT DEFAULT '';
END $$;

-- Create an index for the profession column to speed up text searches
CREATE INDEX IF NOT EXISTS idx_candidates_profession ON public.candidates USING btree (profession);

DO $$
BEGIN
  -- Insert mock data if candidates table is empty so the frontend isn't blank
  IF NOT EXISTS (SELECT 1 FROM public.candidates LIMIT 1) THEN
    INSERT INTO public.candidates (id, name, email, status, profession, resume_data, disc_result, created_at)
    VALUES 
      (gen_random_uuid(), 'Ana Silva', 'ana.silva@email.com', 'Novo', 'Desenvolvedora Frontend', '{"phone": "11999999999", "salary_expectation": 8000}'::jsonb, '{"result": "I"}'::jsonb, NOW() - INTERVAL '2 days'),
      (gen_random_uuid(), 'Carlos Santos', 'carlos.santos@email.com', 'Entrevistado', 'Designer UX/UI', '{"phone": "11888888888", "salary_expectation": 6000}'::jsonb, '{"result": "S"}'::jsonb, NOW() - INTERVAL '5 days'),
      (gen_random_uuid(), 'Beatriz Costa', 'beatriz.costa@email.com', 'Contratado', 'Gerente de Projetos', '{"phone": "11777777777", "salary_expectation": 12000}'::jsonb, '{"result": "D"}'::jsonb, NOW() - INTERVAL '10 days')
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;
