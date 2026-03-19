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
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="absolute top-6 left-6 flex items-center gap-2 font-bold text-xl text-primary z-10">
        <Building2 className="w-6 h-6" />
        <span>Portal do Cliente</span>
      </div>

      <Card className="w-full max-w-md shadow-2xl border border-primary/20 bg-card/50 backdrop-blur-sm z-10">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 ring-1 ring-primary/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Acesse sua conta
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Gerencie suas demandas e documentos em um só lugar.
          </CardDescription>
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
            <Button
              type="submit"
              className="w-full gap-2 text-md h-11 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300"
            >
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
