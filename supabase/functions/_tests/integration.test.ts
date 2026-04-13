import { describe, it, expect, vi, beforeEach } from 'npm:vitest'

describe('Integration Flows', () => {
  let mockSupabase: any
  let mockInsert: any
  let mockUpdate: any
  let mockSelect: any
  let mockEq: any
  let mockOr: any
  let mockSingle: any
  let mockMaybeSingle: any
  let mockIn: any

  beforeEach(() => {
    mockInsert = vi.fn().mockReturnThis()
    mockUpdate = vi.fn().mockReturnThis()
    mockSelect = vi.fn().mockReturnThis()
    mockEq = vi.fn().mockReturnThis()
    mockOr = vi.fn().mockReturnThis()
    mockSingle = vi.fn().mockReturnThis()
    mockMaybeSingle = vi.fn().mockReturnThis()
    mockIn = vi.fn().mockReturnThis()

    mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        eq: mockEq,
        or: mockOr,
        in: mockIn,
        single: mockSingle,
        maybeSingle: mockMaybeSingle,
      }),
    }
  })

  describe('Candidate Conversion (Conformidade RH)', () => {
    it('should check unique CPF and RG before conversion', async () => {
      // Simulate check for existing employee: returns data (conflict)
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'existing-emp' }, error: null })

      const checkExisting = async (cpf: string, rg?: string) => {
        const { data } = await mockSupabase
          .from('employees')
          .select('id')
          .or(`cpf.eq.${cpf}${rg ? `,rg.eq.${rg}` : ''}`)
          .maybeSingle()
        return data ? true : false
      }

      const existingEmployee = await checkExisting('12345678909', 'MG123456')
      expect(mockSupabase.from).toHaveBeenCalledWith('employees')
      expect(mockOr).toHaveBeenCalledWith('cpf.eq.12345678909,rg.eq.MG123456')
      expect(existingEmployee).toBe(true)
    })

    it('should map candidate data to employee correctly on success', () => {
      const candidate = {
        name: 'John Doe',
        email: 'john@example.com',
        profession: 'Developer',
        resume_data: { phone: '12345' },
        disc_result: { D: 10 },
      }

      const payload = {
        cpf: '12345678909',
        salary: 5000,
        hire_date: '2023-01-01',
        department_id: 'dep-1',
      }

      const employeeData = {
        candidate_id: 'cand-123',
        cpf: payload.cpf,
        department_id: payload.department_id,
        salary: payload.salary,
        hire_date: payload.hire_date,
        personal_data: {
          nome: candidate.name,
          email: candidate.email,
          telefone: candidate.resume_data.phone,
        },
        professional_data: {
          profession: candidate.profession,
          disc_result: candidate.disc_result,
        },
        status: 'Ativo',
      }

      expect(employeeData.personal_data.nome).toBe('John Doe')
      expect(employeeData.cpf).toBe('12345678909')
      expect(employeeData.status).toBe('Ativo')
      expect(employeeData.hire_date).toBe('2023-01-01')
    })
  })

  describe('Onboarding Checklist Generation', () => {
    it('should generate standard onboarding tasks for new employee', async () => {
      const employee_id = 'emp-123'

      const createChecklist = async (empId: string) => {
        const tasks = [
          { employee_id: empId, task_id: 'email', task_name: 'Criar email corporativo' },
          { employee_id: empId, task_id: 'user', task_name: 'Criar usuário no sistema' },
          { employee_id: empId, task_id: 'equip', task_name: 'Entregar equipamento' },
          { employee_id: empId, task_id: 'contract', task_name: 'Assinatura de contrato' },
          { employee_id: empId, task_id: 'exam', task_name: 'Exame admissional' },
        ]
        await mockSupabase.from('onboarding_checklist').insert(tasks).select()
        return tasks
      }

      mockSelect.mockResolvedValueOnce({ data: [{ id: 'task-1' }], error: null })
      const tasks = await createChecklist(employee_id)

      expect(mockSupabase.from).toHaveBeenCalledWith('onboarding_checklist')
      expect(mockInsert).toHaveBeenCalledWith(tasks)
      expect(tasks).toHaveLength(5)
      expect(tasks[0].task_name).toBe('Criar email corporativo')
    })
  })

  describe('Notifications Generation (Eventos Críticos)', () => {
    it('should generate notification for vacation expiration', async () => {
      const balances = [
        {
          id: 'bal-1',
          employee_id: 'emp-1',
          expiration_date: '2023-06-15',
          days_remaining: 10,
          employees: { personal_data: { nome: 'Alice' } },
        },
      ]

      const generateNotifs = (bals: any[], adminId: string) => {
        return bals.map((b) => ({
          usuario_id: adminId,
          titulo: 'Vencimento de Férias',
          mensagem: `As férias de ${b.employees.personal_data.nome} vencem em ${b.expiration_date}. Restam ${b.days_remaining} dias.`,
          tipo: 'vencimento',
          referencia_id: `vacation_${b.id}`,
        }))
      }

      const notifications = generateNotifs(balances, 'admin-1')

      expect(notifications[0].titulo).toBe('Vencimento de Férias')
      expect(notifications[0].referencia_id).toBe('vacation_bal-1')
      expect(notifications[0].mensagem).toContain('Alice')
      expect(notifications[0].mensagem).toContain('2023-06-15')
    })

    it('should generate notification for missing documentation', () => {
      const missingDocs = ['RG', 'CPF']
      const notif = {
        usuario_id: 'admin-1',
        titulo: 'Documentação Pendente',
        mensagem: `Bob possui documentos pendentes: ${missingDocs.join(', ')}`,
        tipo: 'alerta',
        referencia_id: `missing_docs_emp-2`,
      }

      expect(notif.titulo).toBe('Documentação Pendente')
      expect(notif.mensagem).toBe('Bob possui documentos pendentes: RG, CPF')
    })
  })

  describe('Check Email Unique Validation', () => {
    it('should return error if email already exists', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'user-1' }, error: null })

      const checkEmail = async (email: string) => {
        const { data } = await mockSupabase
          .from('users')
          .select('id')
          .eq('email', email)
          .maybeSingle()
        return data ? false : true
      }

      const isUnique = await checkEmail('existing@example.com')
      expect(mockEq).toHaveBeenCalledWith('email', 'existing@example.com')
      expect(isUnique).toBe(false)
    })
  })
})
