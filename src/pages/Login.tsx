import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import logoImg from '@/assets/logo-principal-sem-fundo-da717.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('custom-auth', {
        body: { action: 'login', payload: { email, password } },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      if (data?.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
        if (sessionError) throw sessionError

        const intendedUrl = sessionStorage.getItem('intended_url') || '/'
        sessionStorage.removeItem('intended_url')
        navigate(intendedUrl)
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
        description: error?.message ?? 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col relative overflow-hidden">
      {/* Premium Tech Dashboard Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
          }}
        ></div>
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] rounded-full mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(0, 112, 243, 0.1) 0%, transparent 70%)',
          }}
        ></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10 mix-blend-overlay"></div>
      </div>

      <header className="p-6 flex items-center relative z-10"></header>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center justify-center text-center">
            <img
              src={logoImg}
              alt="Era Digital"
              className="h-48 w-auto object-contain mb-6 brightness-0 invert drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            />
            <h2 className="text-3xl font-display font-bold tracking-tight text-white drop-shadow-md">
              Acesso ao Sistema
            </h2>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              Entre com suas credenciais para continuar
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-6 bg-slate-900/80 p-8 rounded-3xl border border-slate-800/80 shadow-[0_8px_40px_rgba(0,0,0,0.4)] relative overflow-hidden"
          >
            {loading && (
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-800/50">
                <div className="h-full bg-gradient-to-r from-primary to-[#0070f3] w-full animate-loading-bar origin-left"></div>
              </div>
            )}
            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 font-medium ml-1">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus:bg-slate-900 focus-visible:bg-slate-900 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 h-12 rounded-xl transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200 font-medium ml-1">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-950/50 border-slate-800 text-white pr-10 focus:bg-slate-900 focus-visible:bg-slate-900 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 h-12 rounded-xl transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-[#0070f3] hover:from-primary/90 hover:to-[#0070f3]/90 text-white font-bold h-12 rounded-xl border-0 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-shadow duration-300 text-base will-change-[box-shadow]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
