import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ArrowRight, Lock } from 'lucide-react'
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
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: 'Login bem-sucedido',
        description: 'Bem-vindo ao CRM.',
      })
      navigate('/')
    } catch (error: any) {
      toast({
        title: 'Erro ao entrar',
        description: error.message || 'Credenciais inválidas.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="absolute top-6 left-6 flex items-center gap-2 font-bold text-xl text-primary z-10">
        <Building2 className="w-6 h-6" />
        <span className="hidden sm:inline-block">CRM Pro</span>
      </div>

      <Card className="w-full max-w-md shadow-2xl border border-primary/20 bg-card/80 backdrop-blur-md z-10 mx-auto rounded-xl">
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <div className="mx-auto w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mb-4 ring-1 ring-primary/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Acesso ao Sistema
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm sm:text-base">
            Insira suas credenciais para gerenciar leads e demandas.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5 px-6 sm:px-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base sm:text-sm">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@exemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base sm:text-sm">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-4 px-6 sm:px-8 pb-8">
            <Button
              type="submit"
              className="w-full gap-2 text-base sm:text-md h-12 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
