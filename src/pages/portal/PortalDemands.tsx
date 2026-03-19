import { useState } from 'react'
import { Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import useDemandStore from '@/stores/useDemandStore'
import useAuthStore from '@/stores/useAuthStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DemandCategory } from '@/types/demand'
import { format } from 'date-fns'

export default function PortalDemands() {
  const { clientId, userName } = useAuthStore()
  const { demands, addDemand } = useDemandStore()
  const [openNewDemand, setOpenNewDemand] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<DemandCategory>('Serviço')

  const clientDemands = demands.filter((d) => d.clientId === clientId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !clientId) return

    addDemand({
      title,
      description,
      priority: 'Durante o Dia', // Default for client submissions
      status: 'Pendente',
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), // + 7 days default
      assignee: 'Não Atribuído',
      clientId,
      category,
    })

    setOpenNewDemand(false)
    setTitle('')
    setDescription('')
    setCategory('Serviço')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluído':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'Em Andamento':
        return <Clock className="w-4 h-4 text-blue-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-amber-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluído':
        return (
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            Concluído
          </Badge>
        )
      case 'Em Andamento':
        return (
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
            Em Andamento
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
            Pendente
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {userName.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o andamento das suas solicitações ou crie uma nova.
          </p>
        </div>

        <Dialog open={openNewDemand} onOpenChange={setOpenNewDemand}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Abrir Solicitação</DialogTitle>
              <DialogDescription>
                Descreva sua necessidade. Nossa equipe analisará e retornará em breve.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Título / Assunto</Label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Nova funcionalidade no app..."
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={(v: DemandCategory) => setCategory(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Serviço">Serviço / Melhoria</SelectItem>
                    <SelectItem value="Dúvida">Dúvida / Suporte</SelectItem>
                    <SelectItem value="Reclamação">Reclamação</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição Detalhada</Label>
                <Textarea
                  required
                  className="min-h-[120px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Forneça o máximo de detalhes possível para agilizar o atendimento..."
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">Enviar Solicitação</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <CardTitle className="text-lg">Suas Demandas Ativas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Data de Criação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientDemands.map((demand) => (
                <TableRow key={demand.id} className="hover:bg-muted/50 cursor-default">
                  <TableCell className="font-medium text-muted-foreground">
                    #{demand.id.toUpperCase().slice(0, 6)}
                  </TableCell>
                  <TableCell className="font-medium">{demand.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {demand.category || 'Serviço'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(demand.status)}
                      {getStatusBadge(demand.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {format(new Date(demand.createdAt), 'dd/MM/yyyy')}
                  </TableCell>
                </TableRow>
              ))}
              {clientDemands.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Você ainda não possui solicitações abertas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
