import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import useAuthStore from '@/stores/useAuthStore'
import useClientStore from '@/stores/useClientStore'
import { useToast } from '@/hooks/use-toast'

export default function PortalLogin() {
  const [email, setEmail] = useState('roberto@techsolutions.com')
  const [password, setPassword] = useState('123456')
  const { loginAsClient } = useAuthStore()
  const { clients } = useClientStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Mock authentication
    const client = clients.find((c) => c.email.toLowerCase() === email.toLowerCase())

    if (client && password === '123456') {
      loginAsClient(client.id, client.name)
      navigate('/portal/demandas')
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo de volta, ${client.name}.`,
      })
    } else {
      toast({
        title: 'Falha na autenticação',
        description: 'Credenciais inválidas. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6 flex items-center gap-2 font-bold text-xl text-primary">
        <Building2 className="w-6 h-6" />
        <span>Portal do Cliente</span>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 ring-1 ring-border/50">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">Acesse sua conta</CardTitle>
          <CardDescription>Gerencie suas demandas e documentos em um só lugar.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com.br"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a
                  href="#"
                  className="text-xs text-primary font-medium hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Esqueci minha senha
                </a>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button type="submit" className="w-full gap-2 text-md h-11">
              Entrar no Portal
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Para testes use: <br />
              <strong>roberto@techsolutions.com</strong> / <strong>123456</strong>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
