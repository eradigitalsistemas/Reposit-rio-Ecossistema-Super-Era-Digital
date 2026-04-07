import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import {
  Demand,
  DemandPriority,
  DemandStatus,
  DemandNotification,
  DemandLog,
  DemandAttachment,
  ChecklistItem,
} from '@/types/demand'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from './useAuthStore'
import { useNavigate } from 'react-router-dom'

import { ChecklistTemplate } from '@/types/demand'

interface Collaborator {
  id: string
  nome: string
}

interface DemandStoreState {
  demands: Demand[]
  collaborators: Collaborator[]
  notifications: DemandNotification[]
  checklistTemplates: ChecklistTemplate[]
  addDemand: (
    demand: Omit<Demand, 'id' | 'createdAt' | 'responses' | 'logs'> & {
      assigneeId?: string | null
    },
  ) => Promise<void>
  editDemand: (
    demandId: string,
    updates: Partial<Omit<Demand, 'id' | 'createdAt' | 'responses' | 'logs'>> & {
      attachments?: DemandAttachment[]
    },
  ) => Promise<void>
  updateStatus: (demandId: string, status: DemandStatus) => Promise<void>
  deleteDemand: (demandId: string) => Promise<void>
  acceptDemand: (demandId: string) => Promise<void>
  completeDemand: (
    demandId: string,
    resposta: string,
    attachments: DemandAttachment[],
  ) => Promise<void>
  addResponse: (demandId: string, text: string, attachments?: DemandAttachment[]) => Promise<void>
  addAttachments: (demandId: string, attachments: DemandAttachment[]) => Promise<void>
  updateChecklist: (
    demandId: string,
    checklist: ChecklistItem[],
    actionText?: string,
  ) => Promise<void>
  markNotificationsAsRead: () => void
  fetchCollaborators: () => Promise<void>
  fetchChecklistTemplates: () => Promise<void>
  addChecklistTemplate: (nome: string, itens: string[]) => Promise<void>
}

const DemandContext = createContext<DemandStoreState | null>(null)

export const DemandProvider = ({ children }: { children: React.ReactNode }) => {
  const [demands, setDemands] = useState<Demand[]>([])
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [notifications, setNotifications] = useState<DemandNotification[]>([])
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([])
  const { user, role, userName } = useAuthStore()
  const navigate = useNavigate()

  const hasFetched = useRef(false)

  const syncChecklistAgenda = async (
    demandId: string,
    demandTitle: string,
    assigneeId: string,
    checklist: ChecklistItem[],
  ) => {
    const updatedChecklist = [...checklist]
    for (let i = 0; i < updatedChecklist.length; i++) {
      const item = updatedChecklist[i]
      if (item.dueDate && !item.completed) {
        if (!item.eventId) {
          const { data } = await supabase
            .from('agenda_eventos')
            .insert({
              titulo: `[Checklist] ${item.text} - ${demandTitle}`,
              descricao: `Link para demanda original: /demandas?highlight=${demandId}`,
              data_inicio: new Date(item.dueDate).toISOString(),
              data_fim: new Date(new Date(item.dueDate).getTime() + 60 * 60 * 1000).toISOString(),
              tipo: 'Tarefa',
              usuario_id: assigneeId,
            })
            .select('id')
            .single()
          if (data) {
            updatedChecklist[i] = { ...item, eventId: data.id }
          }
        } else {
          await supabase
            .from('agenda_eventos')
            .update({
              titulo: `[Checklist] ${item.text} - ${demandTitle}`,
              data_inicio: new Date(item.dueDate).toISOString(),
              data_fim: new Date(new Date(item.dueDate).getTime() + 60 * 60 * 1000).toISOString(),
              usuario_id: assigneeId,
            })
            .eq('id', item.eventId)
        }
      }
    }
    return updatedChecklist
  }

  const fetchDemands = useCallback(async () => {
    if (!user) return
    try {
      let query = supabase
        .from('demandas')
        .select(
          '*, responsavel:usuarios!demandas_responsavel_id_fkey(nome), cliente:clientes_externos(id, nome), logs_auditoria(id, acao, detalhes, usuario_id, dados_novos, data_criacao, usuario:usuarios(nome))',
        )
        .order('data_criacao', { ascending: false })

      if (role !== 'Admin') {
        query = query.eq('responsavel_id', user.id)
      }

      const { data, error } = await query

      if (error) return

      if (data) {
        const parsedDemands = data.map((d: any) => {
          const sortedLogs = Array.isArray(d.logs_auditoria)
            ? [...d.logs_auditoria].sort(
                (a: any, b: any) =>
                  new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime(),
              )
            : []

          const mappedLogs: DemandLog[] = sortedLogs.map((l: any) => ({
            id: l.id || crypto.randomUUID(),
            acao: l.acao,
            detalhes: l.detalhes,
            createdAt: l.data_criacao,
            usuario_id: l.usuario_id,
            userName: l.usuario?.nome || 'Sistema',
            dados_novos: l.dados_novos,
          }))

          const latestPriorityChange = sortedLogs.find(
            (l: any) => l.acao === 'Alteração de Prioridade',
          )
          const systemEscalated =
            latestPriorityChange &&
            latestPriorityChange.usuario_id === null &&
            latestPriorityChange.dados_novos?.prioridade === 'Urgente' &&
            d.prioridade === 'Urgente'

          return {
            id: d.id,
            title: d.titulo || 'Sem título',
            description: d.descricao || '',
            priority: (d.prioridade as DemandPriority) || 'Pode Ficar para Amanhã',
            status: (d.status as DemandStatus) || 'Pendente',
            dueDate: d.data_vencimento || null,
            assignee: (d as any).responsavel?.nome || 'Sem responsável',
            assigneeId: d.responsavel_id || null,
            clientId: d.cliente_id || null,
            clientName: (d as any).cliente?.nome || null,
            responses: d.resposta ? [d.resposta] : [],
            logs: mappedLogs,
            attachments: d.anexos || [],
            checklist: d.checklist || [],
            createdAt: d.data_criacao || new Date().toISOString(),
            systemEscalated: !!systemEscalated,
          }
        })
        setDemands(parsedDemands)
      }
    } catch (e) {
      // Silently handle
    }
  }, [user, role])

  const fetchChecklistTemplates = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .order('data_criacao', { ascending: false })

      if (!error && data) {
        setChecklistTemplates(
          data.map((t: any) => ({
            id: t.id,
            nome: t.nome,
            itens: t.itens,
            usuario_id: t.usuario_id,
            data_criacao: t.data_criacao,
          })),
        )
      }
    } catch (e) {
      // Silently handle
    }
  }, [user])

  const addChecklistTemplate = useCallback(
    async (nome: string, itens: string[]) => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('checklist_templates')
          .insert({
            nome,
            itens,
            usuario_id: user.id,
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          setChecklistTemplates((prev) => [
            {
              id: data.id,
              nome: data.nome,
              itens: data.itens,
              usuario_id: data.usuario_id,
              data_criacao: data.data_criacao,
            },
            ...prev,
          ])
          toast({ title: 'Sucesso', description: 'Template criado com sucesso.' })
        }
      } catch (e) {
        toast({ title: 'Erro', description: 'Erro ao criar template.', variant: 'destructive' })
      }
    },
    [user],
  )

  const fetchCollaborators = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome', { head: false })
        .eq('ativo', true)
        .order('nome')

      if (!error && data) {
        setCollaborators(data)
      }
    } catch (err) {
      console.error('Error fetching collaborators:', err)
    }
  }, [user])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*', { head: false })
        .eq('usuario_id', user.id)
        .order('data_criacao', { ascending: false })
        .limit(50)
      if (!error && data) {
        setNotifications(
          data.map((n: any) => ({
            id: n.id,
            title: n.titulo,
            message: n.mensagem,
            read: n.lida,
            createdAt: n.data_criacao,
            demandId: n.demanda_id,
          })),
        )
      }
    } catch (e) {
      // Silently handle
    }
  }, [user])

  useEffect(() => {
    let isSubscribed = true

    if (role && role !== 'Client' && user && !hasFetched.current) {
      hasFetched.current = true
      fetchDemands()
      fetchCollaborators()
      fetchNotifications()
      fetchChecklistTemplates()

      const usersChannel = supabase
        .channel('usuarios-colab-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, () => {
          if (isSubscribed) fetchCollaborators()
        })
        .subscribe()

      const notifChannel = supabase
        .channel('notificacoes-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notificacoes',
            filter: `usuario_id=eq.${user.id}`,
          },
          (payload) => {
            if (!isSubscribed) return
            const newNotif = payload.new as any
            setNotifications((prev) => [
              {
                id: newNotif.id,
                title: newNotif.titulo,
                message: newNotif.mensagem,
                read: newNotif.lida,
                createdAt: newNotif.data_criacao,
                demandId: newNotif.demanda_id,
              },
              ...prev,
            ])
            toast({
              title: newNotif.titulo,
              description: newNotif.mensagem,
              action: newNotif.demanda_id ? (
                <ToastAction
                  altText="Ver"
                  onClick={() => navigate(`/demandas?highlight=${newNotif.demanda_id}`)}
                >
                  Ver
                </ToastAction>
              ) : undefined,
            })
          },
        )
        .subscribe()

      return () => {
        isSubscribed = false
        supabase.removeChannel(usersChannel)
        supabase.removeChannel(notifChannel)
      }
    }

    return () => {
      isSubscribed = false
    }
  }, [
    role,
    user,
    fetchDemands,
    fetchCollaborators,
    fetchNotifications,
    fetchChecklistTemplates,
    navigate,
  ])

  const markNotificationsAsRead = useCallback(async () => {
    if (!user || !notifications.some((n) => !n.read)) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('usuario_id', user.id)
      .eq('lida', false)
  }, [user, notifications])

  const addDemand = useCallback(
    async (
      newDemand: Omit<Demand, 'id' | 'createdAt' | 'responses' | 'logs'> & {
        assigneeId?: string | null
      },
    ) => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('demandas')
          .insert({
            titulo: newDemand.title || 'Sem título',
            descricao: newDemand.description || null,
            prioridade: newDemand.priority || 'Pode Ficar para Amanhã',
            status: newDemand.status || 'Pendente',
            data_vencimento: newDemand.dueDate || null,
            responsavel_id: newDemand.assigneeId || null,
            usuario_id: user.id,
            anexos: newDemand.attachments || [],
            checklist: newDemand.checklist || [],
          })
          .select('*, responsavel:usuarios(nome)')

        if (error) throw error
        if (data && data.length > 0) {
          const d = data[0]

          let finalChecklist = newDemand.checklist || []
          if (d.responsavel_id && finalChecklist.length > 0) {
            finalChecklist = await syncChecklistAgenda(
              d.id,
              d.titulo,
              d.responsavel_id,
              finalChecklist,
            )
            if (
              finalChecklist.some(
                (item, idx) => item.eventId !== (newDemand.checklist || [])[idx].eventId,
              )
            ) {
              await supabase.from('demandas').update({ checklist: finalChecklist }).eq('id', d.id)
            }
          }

          setDemands((prev) => [
            {
              id: d.id,
              title: d.titulo,
              description: d.descricao || '',
              priority: d.prioridade as DemandPriority,
              status: d.status as DemandStatus,
              dueDate: d.data_vencimento,
              assignee: (d as any).responsavel?.nome || 'Sem responsável',
              assigneeId: d.responsavel_id,
              responses: [],
              logs: [],
              attachments: d.anexos || [],
              checklist: finalChecklist,
              createdAt: d.data_criacao,
              systemEscalated: false,
            },
            ...prev,
          ])
        }
        toast({ title: 'Nova Demanda Criada', description: `A tarefa foi adicionada.` })
      } catch (e) {
        toast({
          title: 'Erro',
          description: 'Não foi possível criar a demanda.',
          variant: 'destructive',
        })
      }
    },
    [user],
  )

  const editDemand = useCallback(
    async (
      demandId: string,
      updates: Partial<
        Omit<Demand, 'id' | 'createdAt' | 'responses' | 'logs'> & {
          attachments?: DemandAttachment[]
        }
      >,
    ) => {
      try {
        const currentDemand = demands.find((d) => d.id === demandId)
        const updateData: any = {}
        let statusChangedToPending = false

        if (updates.title !== undefined) updateData.titulo = updates.title
        if (updates.description !== undefined) updateData.descricao = updates.description
        if (updates.priority !== undefined) updateData.prioridade = updates.priority
        if (updates.dueDate !== undefined) updateData.data_vencimento = updates.dueDate
        if (updates.attachments !== undefined) updateData.anexos = updates.attachments

        if (updates.assigneeId !== undefined) {
          updateData.responsavel_id = updates.assigneeId
          if (currentDemand && updates.assigneeId !== currentDemand.assigneeId) {
            updateData.status = 'Pendente'
            statusChangedToPending = true
          }
        }

        if (updates.status !== undefined && !statusChangedToPending) {
          updateData.status = updates.status
        }

        let finalChecklist = updates.checklist || currentDemand?.checklist || []
        const assigneeIdToSync = updateData.responsavel_id || currentDemand?.assigneeId

        if (
          assigneeIdToSync &&
          (updates.checklist !== undefined ||
            (updates.assigneeId && updates.assigneeId !== currentDemand?.assigneeId))
        ) {
          finalChecklist = await syncChecklistAgenda(
            demandId,
            currentDemand?.title || '',
            assigneeIdToSync,
            finalChecklist,
          )
          updateData.checklist = finalChecklist
        } else if (updates.checklist !== undefined) {
          updateData.checklist = updates.checklist
        }

        const { error } = await supabase.from('demandas').update(updateData).eq('id', demandId)
        if (error) throw error

        toast({ title: 'Demanda Atualizada', description: 'As alterações foram salvas.' })
        fetchDemands()
      } catch (e) {
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar a demanda.',
          variant: 'destructive',
        })
      }
    },
    [fetchDemands, demands],
  )

  const updateStatus = useCallback(async (demandId: string, status: DemandStatus) => {
    setDemands((prev) => prev.map((d) => (d.id === demandId ? { ...d, status } : d)))
    await supabase.from('demandas').update({ status }).eq('id', demandId)
  }, [])

  const deleteDemand = useCallback(async (demandId: string) => {
    const { error } = await supabase.from('demandas').delete().eq('id', demandId)
    if (!error) {
      setDemands((prev) => prev.filter((d) => d.id !== demandId))
      toast({ title: 'Demanda Excluída', description: 'Removida com sucesso.' })
    }
  }, [])

  const acceptDemand = useCallback(
    async (demandId: string) => {
      if (!user) return

      const demand = demands.find((d) => d.id === demandId)
      if (!demand) return

      const newAssigneeId = demand.assigneeId || user.id
      const newAssigneeName = demand.assigneeId ? demand.assignee : userName || 'Você'

      setDemands((prev) =>
        prev.map((d) =>
          d.id === demandId
            ? { ...d, status: 'Em Andamento', assigneeId: newAssigneeId, assignee: newAssigneeName }
            : d,
        ),
      )
      const { error } = await supabase
        .from('demandas')
        .update({ status: 'Em Andamento', responsavel_id: newAssigneeId })
        .eq('id', demandId)

      if (!error) {
        toast({
          title: 'Demanda Aceita',
          description:
            newAssigneeId === user.id
              ? 'Atribuída a você e em andamento.'
              : 'Movida para Em andamento.',
          className:
            'bg-zinc-950 border-green-500/50 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]',
        })
        fetchDemands()
      }
    },
    [user, userName, fetchDemands, demands],
  )

  const completeDemand = useCallback(
    async (demandId: string, resposta: string, newAttachments: DemandAttachment[]) => {
      try {
        const { data } = await supabase
          .from('demandas')
          .select('anexos')
          .eq('id', demandId)
          .single()
        const updatedAttachments = [...(data?.anexos || []), ...newAttachments]

        const { error } = await supabase
          .from('demandas')
          .update({
            status: 'Concluído',
            resposta,
            data_resposta: new Date().toISOString(),
            anexos: updatedAttachments,
          })
          .eq('id', demandId)

        if (error) throw error

        setDemands((prev) =>
          prev.map((d) =>
            d.id === demandId
              ? {
                  ...d,
                  status: 'Concluído',
                  responses: d.responses ? [...d.responses, resposta] : [resposta],
                  attachments: updatedAttachments,
                }
              : d,
          ),
        )

        toast({
          title: 'Demanda Concluída',
          description: 'A demanda foi finalizada com sucesso.',
          className:
            'bg-zinc-950 border-green-500/50 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]',
        })
      } catch (e) {
        toast({ title: 'Erro', description: 'Erro ao concluir demanda.', variant: 'destructive' })
      }
    },
    [],
  )

  const addResponse = useCallback(
    async (demandId: string, text: string, attachments?: DemandAttachment[]) => {
      if (!user || !demandId) {
        console.error('Erro Arquitetural: user_id ou demanda_id inválido/nulo.')
        return
      }

      const newLogId = crypto.randomUUID()
      const hasAttachments = attachments && attachments.length > 0
      const acaoType = hasAttachments && !text.trim() ? 'Anexo' : 'Comentário'
      const detalhesText =
        text.trim() ||
        (hasAttachments
          ? `Arquivo(s) anexado(s): ${attachments.map((a) => a.name).join(', ')}`
          : '')

      try {
        let finalAttachments = attachments

        if (hasAttachments) {
          const { data, error: fetchErr } = await supabase
            .from('demandas')
            .select('anexos')
            .eq('id', demandId)
            .single()

          if (fetchErr) {
            console.error('Erro ao buscar anexos da demanda:', fetchErr)
            throw fetchErr
          }

          finalAttachments = [...(data?.anexos || []), ...attachments]
          const { error: updateErr } = await supabase
            .from('demandas')
            .update({ anexos: finalAttachments })
            .eq('id', demandId)

          if (updateErr) {
            console.error('Erro ao atualizar anexos na demanda:', updateErr)
            throw updateErr
          }
        }

        const { error } = await supabase.from('logs_auditoria').insert({
          id: newLogId,
          demanda_id: demandId,
          usuario_id: user.id,
          acao: acaoType,
          detalhes: detalhesText,
          dados_novos: hasAttachments ? { anexos: attachments } : undefined,
        })

        if (error) {
          console.error('Erro real do Supabase ao inserir log_auditoria:', error)
          throw error
        }

        const newLog: DemandLog = {
          id: newLogId,
          acao: acaoType,
          detalhes: detalhesText,
          createdAt: new Date().toISOString(),
          usuario_id: user.id,
          userName: userName || 'Você',
          dados_novos: hasAttachments ? { anexos: attachments } : undefined,
        }

        setDemands((prev) =>
          prev.map((d) =>
            d.id === demandId
              ? {
                  ...d,
                  logs: [...(d.logs || []), newLog],
                  attachments: hasAttachments ? finalAttachments : d.attachments,
                }
              : d,
          ),
        )

        toast({
          title: 'Sucesso',
          description: 'Registro adicionado na linha do tempo.',
          className:
            'bg-zinc-950 border-green-500/50 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]',
        })
        fetchDemands()
      } catch (err: any) {
        toast({
          title: 'Erro de Inserção',
          description: err.message || 'Falha ao registrar observação.',
          variant: 'destructive',
        })
      }
    },
    [user, userName, fetchDemands],
  )

  const updateChecklist = useCallback(
    async (demandId: string, checklist: ChecklistItem[], actionText?: string) => {
      if (!user) return

      const currentDemand = demands.find((d) => d.id === demandId)
      if (currentDemand?.assigneeId) {
        checklist = await syncChecklistAgenda(
          demandId,
          currentDemand.title,
          currentDemand.assigneeId,
          checklist,
        )
      }

      setDemands((prev) => prev.map((d) => (d.id === demandId ? { ...d, checklist } : d)))
      await supabase.from('demandas').update({ checklist }).eq('id', demandId)

      if (actionText) {
        await supabase.from('logs_auditoria').insert({
          demanda_id: demandId,
          usuario_id: user.id,
          acao: 'Checklist',
          detalhes: actionText,
        })
        fetchDemands()
      }
    },
    [user, fetchDemands, demands],
  )

  const addAttachments = useCallback(
    async (demandId: string, newAttachments: DemandAttachment[]) => {
      if (!user) return
      try {
        const newLogId = crypto.randomUUID()
        const newLog: DemandLog = {
          id: newLogId,
          acao: 'Anexo',
          detalhes: `Arquivo(s) anexado(s): ${newAttachments.map((a) => a.name).join(', ')}`,
          dados_novos: { anexos: newAttachments },
          createdAt: new Date().toISOString(),
          usuario_id: user.id,
          userName: userName || 'Você',
        }

        setDemands((prev) =>
          prev.map((d) => {
            if (d.id === demandId) {
              const updatedAttachments = [...(d.attachments || []), ...newAttachments]
              return { ...d, attachments: updatedAttachments, logs: [...(d.logs || []), newLog] }
            }
            return d
          }),
        )

        const { data } = await supabase
          .from('demandas')
          .select('anexos')
          .eq('id', demandId)
          .single()
        const updatedAttachments = [...(data?.anexos || []), ...newAttachments]
        await supabase.from('demandas').update({ anexos: updatedAttachments }).eq('id', demandId)

        await supabase.from('logs_auditoria').insert({
          demanda_id: demandId,
          usuario_id: user.id,
          acao: 'Anexo',
          detalhes: `Arquivo(s) anexado(s): ${newAttachments.map((a) => a.name).join(', ')}`,
          dados_novos: { anexos: newAttachments },
        })

        fetchDemands()
      } catch (e) {
        toast({ title: 'Erro', description: 'Erro ao salvar anexos.', variant: 'destructive' })
      }
    },
    [user, userName, fetchDemands],
  )

  const value = useMemo(
    () => ({
      demands,
      collaborators,
      notifications,
      checklistTemplates,
      addDemand,
      editDemand,
      updateStatus,
      deleteDemand,
      acceptDemand,
      completeDemand,
      addResponse,
      addAttachments,
      updateChecklist,
      markNotificationsAsRead,
      fetchCollaborators,
      fetchChecklistTemplates,
      addChecklistTemplate,
    }),
    [
      demands,
      collaborators,
      notifications,
      checklistTemplates,
      addDemand,
      editDemand,
      updateStatus,
      deleteDemand,
      acceptDemand,
      completeDemand,
      addResponse,
      addAttachments,
      updateChecklist,
      markNotificationsAsRead,
      fetchCollaborators,
      fetchChecklistTemplates,
      addChecklistTemplate,
    ],
  )

  return <DemandContext.Provider value={value}>{children}</DemandContext.Provider>
}

export default function useDemandStore() {
  const context = useContext(DemandContext)
  if (!context) throw new Error('useDemandStore must be used within a DemandProvider')
  return context
}
