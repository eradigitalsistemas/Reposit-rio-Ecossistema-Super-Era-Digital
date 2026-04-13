-- Migration: Time Tracking V2 (Multi-tenant, Audit, Schedules)

-- 1. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert Default Organization
INSERT INTO public.organizations (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Super Era Digital') 
ON CONFLICT (id) DO NOTHING;

-- 2. Clean legacy time_entries
DROP TABLE IF EXISTS public.time_entries CASCADE;

CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('entrada', 'intervalo_saida', 'intervalo_entrada', 'saida')),
    timestamp TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT unique_daily_entry_type UNIQUE (organization_id, employee_id, entry_date, entry_type)
);

CREATE INDEX IF NOT EXISTS idx_time_entries_org_emp_date ON public.time_entries(organization_id, employee_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_org_date ON public.time_entries(organization_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_emp_date ON public.time_entries(employee_id, entry_date);

-- 3. department_schedules
CREATE TABLE IF NOT EXISTS public.department_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    lunch_duration_minutes INTEGER NOT NULL,
    tolerance_minutes INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_org_dept_schedule UNIQUE (organization_id, department_id),
    CONSTRAINT check_start_end_time CHECK (start_time < end_time),
    CONSTRAINT check_lunch_duration CHECK (lunch_duration_minutes > 0),
    CONSTRAINT check_tolerance CHECK (tolerance_minutes >= 0)
);

CREATE INDEX IF NOT EXISTS idx_dept_schedules_org_dept ON public.department_schedules(organization_id, department_id);

-- 4. monthly_timesheets
CREATE TABLE IF NOT EXISTS public.monthly_timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    total_hours_worked DECIMAL(8,2) NOT NULL DEFAULT 0,
    total_extra_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    total_delays_minutes INTEGER NOT NULL DEFAULT 0,
    total_absences INTEGER NOT NULL DEFAULT 0,
    days_worked INTEGER NOT NULL DEFAULT 0,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT unique_org_emp_year_month UNIQUE (organization_id, employee_id, year, month),
    CONSTRAINT check_year CHECK (year >= 2020),
    CONSTRAINT check_month CHECK (month BETWEEN 1 AND 12)
);

CREATE INDEX IF NOT EXISTS idx_monthly_timesheets_lookup ON public.monthly_timesheets(organization_id, employee_id, year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_timesheets_org_date ON public.monthly_timesheets(organization_id, year, month);

-- 5. time_entries_audit
CREATE TABLE IF NOT EXISTS public.time_entries_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_entry_id UUID NOT NULL REFERENCES public.time_entries(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_entries_audit_lookup ON public.time_entries_audit(organization_id, time_entry_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_audit_date ON public.time_entries_audit(organization_id, changed_at);

-- RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_organizations" ON public.organizations;
CREATE POLICY "auth_all_organizations" ON public.organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_time_entries" ON public.time_entries;
CREATE POLICY "auth_all_time_entries" ON public.time_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_department_schedules" ON public.department_schedules;
CREATE POLICY "auth_all_department_schedules" ON public.department_schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_monthly_timesheets" ON public.monthly_timesheets;
CREATE POLICY "auth_all_monthly_timesheets" ON public.monthly_timesheets FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_time_entries_audit" ON public.time_entries_audit;
CREATE POLICY "auth_all_time_entries_audit" ON public.time_entries_audit FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Triggers
CREATE OR REPLACE FUNCTION public.set_time_entries_updated_at()
RETURNS trigger AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_time_entries_updated_at ON public.time_entries;
CREATE TRIGGER trg_time_entries_updated_at
    BEFORE UPDATE ON public.time_entries
    FOR EACH ROW EXECUTE FUNCTION public.set_time_entries_updated_at();

DROP TRIGGER IF EXISTS trg_department_schedules_updated_at ON public.department_schedules;
CREATE TRIGGER trg_department_schedules_updated_at
    BEFORE UPDATE ON public.department_schedules
    FOR EACH ROW EXECUTE FUNCTION public.set_time_entries_updated_at();

CREATE OR REPLACE FUNCTION public.audit_time_entries()
RETURNS trigger AS $function$
DECLARE
    v_user_id UUID;
BEGIN
    BEGIN
        v_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.time_entries_audit (time_entry_id, organization_id, action, new_values, changed_by)
        VALUES (NEW.id, NEW.organization_id, 'created', to_jsonb(NEW), COALESCE(NEW.created_by, v_user_id));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.time_entries_audit (time_entry_id, organization_id, action, old_values, new_values, changed_by)
        VALUES (NEW.id, NEW.organization_id, 'updated', to_jsonb(OLD), to_jsonb(NEW), v_user_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.time_entries_audit (time_entry_id, organization_id, action, old_values, changed_by)
        VALUES (OLD.id, OLD.organization_id, 'deleted', to_jsonb(OLD), v_user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_time_entries ON public.time_entries;
CREATE TRIGGER trg_audit_time_entries
    AFTER INSERT OR UPDATE OR DELETE ON public.time_entries
    FOR EACH ROW EXECUTE FUNCTION public.audit_time_entries();

CREATE OR REPLACE FUNCTION public.validate_time_entries_sequence()
RETURNS trigger AS $function$
DECLARE
    v_previous_entry TEXT;
BEGIN
    SELECT entry_type INTO v_previous_entry
    FROM public.time_entries
    WHERE employee_id = NEW.employee_id
      AND entry_date = NEW.entry_date
      AND id != NEW.id
    ORDER BY timestamp DESC
    LIMIT 1;

    IF NEW.entry_type = 'intervalo_saida' THEN
        IF v_previous_entry IS NULL OR v_previous_entry != 'entrada' THEN
            RAISE EXCEPTION 'A saída para intervalo só pode ocorrer após uma entrada.';
        END IF;
    ELSIF NEW.entry_type = 'intervalo_entrada' THEN
        IF v_previous_entry IS NULL OR v_previous_entry != 'intervalo_saida' THEN
            RAISE EXCEPTION 'O retorno do intervalo só pode ocorrer após uma saída para intervalo.';
        END IF;
    ELSIF NEW.entry_type = 'saida' THEN
        IF v_previous_entry IS NULL OR v_previous_entry NOT IN ('entrada', 'intervalo_entrada') THEN
            RAISE EXCEPTION 'A saída só pode ocorrer após uma entrada ou retorno de intervalo.';
        END IF;
    ELSIF NEW.entry_type = 'entrada' THEN
        IF v_previous_entry IS NOT NULL THEN
            RAISE EXCEPTION 'Já existe um registro para este dia anterior à entrada.';
        END IF;
    END IF;

    RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_time_entries_sequence ON public.time_entries;
CREATE TRIGGER trg_validate_time_entries_sequence
    BEFORE INSERT ON public.time_entries
    FOR EACH ROW EXECUTE FUNCTION public.validate_time_entries_sequence();

CREATE OR REPLACE FUNCTION public.update_monthly_timesheet()
RETURNS trigger AS $function$
DECLARE
    v_year INTEGER;
    v_month INTEGER;
BEGIN
    v_year := EXTRACT(YEAR FROM NEW.entry_date);
    v_month := EXTRACT(MONTH FROM NEW.entry_date);
    
    INSERT INTO public.monthly_timesheets (organization_id, employee_id, year, month, days_worked)
    VALUES (NEW.organization_id, NEW.employee_id, v_year, v_month, 1)
    ON CONFLICT (organization_id, employee_id, year, month) DO UPDATE
    SET days_worked = public.monthly_timesheets.days_worked + 1;
    
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_monthly_timesheet ON public.time_entries;
CREATE TRIGGER trg_update_monthly_timesheet
    AFTER INSERT ON public.time_entries
    FOR EACH ROW
    WHEN (NEW.entry_type = 'entrada')
    EXECUTE FUNCTION public.update_monthly_timesheet();

DO $DO$
DECLARE
    emp_record RECORD;
BEGIN
    FOR emp_record IN SELECT DISTINCT department_id FROM public.employees WHERE department_id IS NOT NULL LOOP
        INSERT INTO public.department_schedules (organization_id, department_id, start_time, end_time, lunch_duration_minutes, tolerance_minutes)
        VALUES ('00000000-0000-0000-0000-000000000001'::uuid, emp_record.department_id, '08:00', '17:00', 60, 5)
        ON CONFLICT (organization_id, department_id) DO NOTHING;
    END LOOP;
END;
$DO$;
