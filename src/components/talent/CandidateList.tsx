import { useCandidateStore } from '@/stores/useCandidateStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Briefcase, DollarSign, Calendar, AlertCircle } from 'lucide-react'

export function CandidateList() {
  const { candidates, loading, error, setSelectedCandidate, setDetailsOpen } = useCandidateStore()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-destructive border rounded-lg border-dashed">
        <AlertCircle className="h-10 w-10 mb-4 opacity-50" />
        <p>Erro ao carregar currículos</p>
        <p className="text-sm opacity-80 mt-1">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse h-36 bg-muted/20" />
        ))}
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg border-dashed bg-card/30">
        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p>Nenhum candidato encontrado com os filtros atuais.</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Novo':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
      case 'Entrevistado':
        return 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
      case 'Contratado':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      case 'Rejeitado':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
      {candidates.map((candidate) => (
        <Card
          key={candidate.id}
          className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
          onClick={() => {
            setSelectedCandidate(candidate)
            setDetailsOpen(true)
          }}
        >
          <CardContent className="p-5 flex flex-col h-full gap-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar className="h-12 w-12 border shadow-sm">
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/thumbnail?seed=${candidate.id}`}
                  />
                  <AvatarFallback className="font-medium text-muted-foreground">
                    {candidate.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <h3
                    className="font-semibold truncate text-base group-hover:text-primary transition-colors"
                    title={candidate.name}
                  >
                    {candidate.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate" title={candidate.email}>
                    {candidate.email}
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={`shrink-0 border-0 ${getStatusColor(candidate.status)}`}
              >
                {candidate.status}
              </Badge>
            </div>

            <div className="mt-auto space-y-2.5 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
              <div className="flex items-center gap-2 truncate">
                <Briefcase className="h-4 w-4 shrink-0 text-primary/70" />
                <span className="truncate font-medium text-foreground/80">
                  {candidate.profession || 'Não informado'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 shrink-0 text-primary/70" />
                <span>
                  {candidate.resume_data?.salary_expectation
                    ? `R$ ${candidate.resume_data.salary_expectation}`
                    : 'Não informado'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
                <span>
                  {format(new Date(candidate.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
