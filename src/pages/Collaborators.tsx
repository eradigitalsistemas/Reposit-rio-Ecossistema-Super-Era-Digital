import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import useAuthStore from '@/stores/useAuthStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Mail, Building2 } from 'lucide-react'

export default function Collaborators() {
  const { role } = useAuthStore()
  const navigate = useNavigate()

  if (role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground mb-6">
          Apenas administradores podem acessar a gestão de colaboradores.
        </p>
        <Button onClick={() => navigate('/')} variant="default">
          Voltar ao Início
        </Button>
      </div>
    )
  }

  const collaborators = [
    { id: '1', name: 'Ana Silva', email: 'ana@crm.com', role: 'Admin', department: 'Diretoria' },
    {
      id: '2',
      name: 'Carlos Santos',
      email: 'carlos@crm.com',
      role: 'Colaborador',
      department: 'Vendas',
    },
    {
      id: '3',
      name: 'Mariana Costa',
      email: 'mariana@crm.com',
      role: 'Colaborador',
      department: 'Marketing',
    },
    {
      id: '4',
      name: 'João Oliveira',
      email: 'joao@crm.com',
      role: 'Colaborador',
      department: 'Suporte',
    },
  ]

  return (
    <div className="h-full w-full bg-slate-50/50 dark:bg-background flex flex-col p-4 sm:p-6 overflow-y-auto sm:overflow-hidden">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Equipe e Acessos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie os colaboradores, departamentos e níveis de acesso ao sistema.
        </p>
      </div>

      {/* Desktop View */}
      <Card className="hidden md:flex flex-1 overflow-hidden flex-col">
        <CardContent className="p-0 overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Perfil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborators.map((collab) => (
                <TableRow key={collab.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{collab.name}</TableCell>
                  <TableCell className="text-muted-foreground">{collab.email}</TableCell>
                  <TableCell>{collab.department}</TableCell>
                  <TableCell>
                    <Badge variant={collab.role === 'Admin' ? 'default' : 'secondary'}>
                      {collab.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile View */}
      <div className="flex flex-col gap-4 md:hidden pb-6">
        {collaborators.map((collab) => (
          <Card key={collab.id}>
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div className="font-semibold text-lg leading-tight">{collab.name}</div>
                <Badge
                  variant={collab.role === 'Admin' ? 'default' : 'secondary'}
                  className="shrink-0"
                >
                  {collab.role}
                </Badge>
              </div>
              <div className="space-y-1.5 mt-1">
                <div className="text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{collab.email}</span>
                </div>
                <div className="text-sm flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>{collab.department}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
