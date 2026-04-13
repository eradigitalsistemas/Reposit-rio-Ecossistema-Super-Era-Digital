-- Migration: Create HR Module Tables and Relations

-- 1. Departments
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    manager_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Candidates
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    resume_data JSONB DEFAULT '{}'::jsonb,
    disc_result JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'Novo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Employees
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
    cpf TEXT UNIQUE NOT NULL,
    rg TEXT UNIQUE,
    personal_data JSONB DEFAULT '{}'::jsonb,
    professional_data JSONB DEFAULT '{}'::jsonb,
    salary NUMERIC(10, 2),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Ativo',
    hire_date DATE NOT NULL,
    experience_end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_experience_date CHECK (experience_end_date IS NULL OR experience_end_date >= hire_date)
);

-- 4. Time Entries
CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    entry_time TIME,
    exit_time TIME,
    break_duration INTERVAL,
    hours_worked NUMERIC(5,2),
    overtime NUMERIC(5,2),
    delay NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Vacation Requests
CREATE TABLE IF NOT EXISTS public.vacation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    approved_by UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    approval_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_vacation_dates CHECK (end_date >= start_date)
);

-- 6. Vacation Balance
CREATE TABLE IF NOT EXISTS public.vacation_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    days_accrued NUMERIC(5,2) NOT NULL DEFAULT 0,
    days_used NUMERIC(5,2) NOT NULL DEFAULT 0,
    days_remaining NUMERIC(5,2) NOT NULL DEFAULT 0,
    expiration_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_positive_balance CHECK (days_remaining >= 0)
);

-- 7. Onboarding Checklist
CREATE TABLE IF NOT EXISTS public.onboarding_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    task_id TEXT,
    task_name TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiration_date DATE,
    status TEXT NOT NULL DEFAULT 'Válido',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON public.candidates(created_at);

CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON public.employees(created_at);

CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON public.time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON public.time_entries(date);

CREATE INDEX IF NOT EXISTS idx_vacation_requests_employee_id ON public.vacation_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_status ON public.vacation_requests(status);

CREATE INDEX IF NOT EXISTS idx_vacation_balance_employee_id ON public.vacation_balance(employee_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_checklist_employee_id ON public.onboarding_checklist(employee_id);

CREATE INDEX IF NOT EXISTS idx_documents_employee_id ON public.documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies (MVP: All authenticated users have full access, establishing baseline for future granular permissions)
DROP POLICY IF EXISTS "auth_all_departments" ON public.departments;
CREATE POLICY "auth_all_departments" ON public.departments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_candidates" ON public.candidates;
CREATE POLICY "auth_all_candidates" ON public.candidates FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_employees" ON public.employees;
CREATE POLICY "auth_all_employees" ON public.employees FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_time_entries" ON public.time_entries;
CREATE POLICY "auth_all_time_entries" ON public.time_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_vacation_requests" ON public.vacation_requests;
CREATE POLICY "auth_all_vacation_requests" ON public.vacation_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_vacation_balance" ON public.vacation_balance;
CREATE POLICY "auth_all_vacation_balance" ON public.vacation_balance FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_onboarding_checklist" ON public.onboarding_checklist;
CREATE POLICY "auth_all_onboarding_checklist" ON public.onboarding_checklist FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_documents" ON public.documents;
CREATE POLICY "auth_all_documents" ON public.documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger for Employees updated_at
DROP TRIGGER IF EXISTS set_public_employees_updated_at ON public.employees;
CREATE TRIGGER set_public_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();
