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
    <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6 flex items-center gap-2 font-bold text-xl text-primary">
        <Building2 className="w-6 h-6" />
        <span>CRM Pro</span>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 ring-1 ring-border/50">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Acesso ao Sistema</CardTitle>
          <CardDescription>
            Insira suas credenciais para gerenciar leads e demandas.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
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
              <Label htmlFor="password">Senha</Label>
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
            <Button type="submit" className="w-full gap-2 text-md h-11" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
