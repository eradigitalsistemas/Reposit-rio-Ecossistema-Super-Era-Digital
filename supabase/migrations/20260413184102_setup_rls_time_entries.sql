-- Helper functions for RLS

CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid AS $$
  SELECT COALESCE(
    (raw_user_meta_data->>'organization_id')::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid
  )
  FROM auth.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_employee_id()
RETURNS uuid AS $$
  SELECT COALESCE(
    (SELECT (raw_user_meta_data->>'employee_id')::uuid FROM auth.users WHERE id = auth.uid()),
    (SELECT id FROM public.employees WHERE personal_data->>'email' = (SELECT email FROM auth.users WHERE id = auth.uid()) LIMIT 1)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT perfil FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- TIME ENTRIES RLS

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_time_entries" ON public.time_entries;

DROP POLICY IF EXISTS "time_entries_select_policy" ON public.time_entries;
CREATE POLICY "time_entries_select_policy" ON public.time_entries
  FOR SELECT TO authenticated
  USING (
    organization_id = public.get_user_org_id() AND
    (
      employee_id = public.get_user_employee_id() OR
      created_by = auth.uid() OR
      public.get_user_role() IN ('admin', 'rh') OR
      (
        public.get_user_role() = 'gestor' AND
        employee_id IN (
          SELECT id FROM public.employees WHERE department_id IN (
            SELECT id FROM public.departments WHERE manager_id = auth.uid()
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS "time_entries_insert_policy" ON public.time_entries;
CREATE POLICY "time_entries_insert_policy" ON public.time_entries
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_user_org_id() AND
    (
       (employee_id = public.get_user_employee_id() AND created_by = auth.uid()) OR
       public.get_user_role() IN ('admin', 'rh')
    )
  );

DROP POLICY IF EXISTS "time_entries_update_policy" ON public.time_entries;
CREATE POLICY "time_entries_update_policy" ON public.time_entries
  FOR UPDATE TO authenticated
  USING (
    organization_id = public.get_user_org_id() AND
    public.get_user_role() IN ('admin', 'rh')
  )
  WITH CHECK (
    organization_id = public.get_user_org_id() AND
    public.get_user_role() IN ('admin', 'rh')
  );

DROP POLICY IF EXISTS "time_entries_delete_policy" ON public.time_entries;
CREATE POLICY "time_entries_delete_policy" ON public.time_entries
  FOR DELETE TO authenticated
  USING (
    organization_id = public.get_user_org_id() AND
    public.get_user_role() IN ('admin', 'rh')
  );


-- MONTHLY TIMESHEETS RLS

ALTER TABLE public.monthly_timesheets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_monthly_timesheets" ON public.monthly_timesheets;

DROP POLICY IF EXISTS "monthly_timesheets_select_policy" ON public.monthly_timesheets;
CREATE POLICY "monthly_timesheets_select_policy" ON public.monthly_timesheets
  FOR SELECT TO authenticated
  USING (
    organization_id = public.get_user_org_id() AND
    (
      employee_id = public.get_user_employee_id() OR
      public.get_user_role() IN ('admin', 'rh') OR
      (
        public.get_user_role() = 'gestor' AND
        employee_id IN (
          SELECT id FROM public.employees WHERE department_id IN (
            SELECT id FROM public.departments WHERE manager_id = auth.uid()
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS "monthly_timesheets_insert_policy" ON public.monthly_timesheets;
CREATE POLICY "monthly_timesheets_insert_policy" ON public.monthly_timesheets
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_user_org_id() AND
    public.get_user_role() IN ('admin', 'rh')
  );

DROP POLICY IF EXISTS "monthly_timesheets_update_policy" ON public.monthly_timesheets;
CREATE POLICY "monthly_timesheets_update_policy" ON public.monthly_timesheets
  FOR UPDATE TO authenticated
  USING (
    organization_id = public.get_user_org_id() AND
    public.get_user_role() IN ('admin', 'rh')
  )
  WITH CHECK (
    organization_id = public.get_user_org_id() AND
    public.get_user_role() IN ('admin', 'rh')
  );

DROP POLICY IF EXISTS "monthly_timesheets_delete_policy" ON public.monthly_timesheets;
CREATE POLICY "monthly_timesheets_delete_policy" ON public.monthly_timesheets
  FOR DELETE TO authenticated
  USING (
    organization_id = public.get_user_org_id() AND
    public.get_user_role() IN ('admin', 'rh')
  );


-- TIME ENTRIES AUDIT RLS

ALTER TABLE public.time_entries_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_time_entries_audit" ON public.time_entries_audit;

DROP POLICY IF EXISTS "time_entries_audit_select_policy" ON public.time_entries_audit;
CREATE POLICY "time_entries_audit_select_policy" ON public.time_entries_audit
  FOR SELECT TO authenticated
  USING (
    organization_id = public.get_user_org_id() AND
    public.get_user_role() IN ('admin', 'rh')
  );

DROP POLICY IF EXISTS "time_entries_audit_insert_policy" ON public.time_entries_audit;
CREATE POLICY "time_entries_audit_insert_policy" ON public.time_entries_audit
  FOR INSERT TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "time_entries_audit_update_policy" ON public.time_entries_audit;
CREATE POLICY "time_entries_audit_update_policy" ON public.time_entries_audit
  FOR UPDATE TO authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "time_entries_audit_delete_policy" ON public.time_entries_audit;
CREATE POLICY "time_entries_audit_delete_policy" ON public.time_entries_audit
  FOR DELETE TO authenticated
  USING (false);


-- DEPARTMENT SCHEDULES RLS

ALTER TABLE public.department_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_department_schedules" ON public.department_schedules;

DROP POLICY IF EXISTS "department_schedules_select_policy" ON public.department_schedules;
CREATE POLICY "department_schedules_select_policy" ON public.department_schedules
  FOR SELECT TO authenticated
  USING (organization_id = public.get_user_org_id());

DROP POLICY IF EXISTS "department_schedules_insert_policy" ON public.department_schedules;
CREATE POLICY "department_schedules_insert_policy" ON public.department_schedules
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_user_org_id() AND
    public.get_user_role() IN ('admin', 'rh')
  );

DROP POLICY IF EXISTS "department_schedules_update_policy" ON public.department_schedules;
CREATE POLICY "department_schedules_update_policy" ON public.department_schedules
  FOR UPDATE TO authenticated
  USING (
    organization_id = public.get_user_org_id() AND
    public.get_user_role() IN ('admin', 'rh')
  )
  WITH CHECK (
    organization_id = public.get_user_org_id() AND
    public.get_user_role() IN ('admin', 'rh')
  );

DROP POLICY IF EXISTS "department_schedules_delete_policy" ON public.department_schedules;
CREATE POLICY "department_schedules_delete_policy" ON public.department_schedules
  FOR DELETE TO authenticated
  USING (
    organization_id = public.get_user_org_id() AND
    public.get_user_role() IN ('admin', 'rh')
  );
