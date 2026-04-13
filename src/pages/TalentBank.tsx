import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Search, Briefcase, Clock, FileText } from 'lucide-react'
import { getCandidates, updateCandidate } from '@/services/candidates'
import { format } from 'date-fns'

export default function TalentBank() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { toast } = useToast()

  const loadCandidates = async () => {
    try {
      setLoading(true)
      const res = await getCandidates({
        search: search.length >= 2 ? search : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
      setCandidates(res.data || [])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar candidatos',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCandidates()
    }, 500)
    return () => clearTimeout(timer)
  }, [search, statusFilter])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateCandidate(id, { status: newStatus })
      toast({ title: 'Status atualizado com sucesso' })
      loadCandidates()
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Banco de Talentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os currículos recebidos e converta talentos em colaboradores.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou profissão..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="Novo">Novo</SelectItem>
            <SelectItem value="Entrevistado">Entrevistado</SelectItem>
            <SelectItem value="Rejeitado">Rejeitado</SelectItem>
            <SelectItem value="Contratado">Contratado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-48 bg-muted/20" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Nenhum candidato encontrado com os filtros atuais.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <Card
              key={candidate.id}
              className="overflow-hidden hover:shadow-md transition-shadow group"
            >
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{candidate.name}</CardTitle>
                    <p
                      className="text-sm text-muted-foreground truncate max-w-[200px]"
                      title={candidate.email}
                    >
                      {candidate.email}
                    </p>
                  </div>
                  <Badge
                    variant={
                      candidate.status === 'Novo'
                        ? 'default'
                        : candidate.status === 'Contratado'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {candidate.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Briefcase className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">{candidate.profession || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 shrink-0" />
                    {format(new Date(candidate.created_at), 'dd/MM/yyyy')}
                  </div>
                </div>

                {candidate.disc_result && (
                  <div className="flex items-center gap-2 mt-2 bg-primary/5 p-2 rounded-md">
                    <span className="text-xs font-semibold text-primary">DISC:</span>
                    <span className="text-xs">
                      {candidate.disc_result.result || candidate.disc_result.tipo_perfil || 'N/A'}
                    </span>
                  </div>
                )}

                <div className="pt-4 flex gap-2 border-t">
                  <Select
                    value={candidate.status}
                    onValueChange={(val) => handleStatusChange(candidate.id, val)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Novo">Novo</SelectItem>
                      <SelectItem value="Entrevistado">Entrevistado</SelectItem>
                      <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                      <SelectItem value="Contratado">Contratado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Ver currículo">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
