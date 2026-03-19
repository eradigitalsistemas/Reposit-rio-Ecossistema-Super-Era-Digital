import { useState, useEffect } from 'react'
import { User, Bell, Shield, Save, Loader2 } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export default function Settings() {
  const { user, userName, role } = useAuthStore()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (userName) setName(userName)
    if (user?.email) setEmail(user.email)
  }, [userName, user])

  const handleSaveProfile = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const { error } = await supabase.from('usuarios').update({ nome: name }).eq('id', user.id)
      if (error) throw error
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-full w-full bg-slate-50/50 dark:bg-background flex flex-col p-6 overflow-y-auto">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie as preferências da sua conta e do sistema.
        </p>
      </div>

      <Tabs defaultValue="profile" className="flex-1 flex flex-col max-w-4xl">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 p-0 space-x-6 shrink-0 mb-6">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 gap-2"
          >
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 gap-2"
          >
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 gap-2"
          >
            <Shield className="w-4 h-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="m-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seus dados básicos e como você é visto no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 max-w-md">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div className="grid gap-2 max-w-md">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} disabled className="bg-muted" />
                <p className="text-[10px] text-muted-foreground">
                  O e-mail não pode ser alterado por aqui.
                </p>
              </div>
              <div className="grid gap-2 max-w-md">
                <Label>Perfil de Acesso</Label>
                <Input value={role || ''} disabled className="bg-muted" />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="m-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Escolha como deseja ser avisado sobre atualizações importantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label>Notificações por E-mail</Label>
                  <span className="text-sm text-muted-foreground">
                    Receba resumos diários e alertas de demandas urgentes.
                  </span>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label>Notificações no Navegador (Push)</Label>
                  <span className="text-sm text-muted-foreground">
                    Seja avisado instantaneamente quando algo for atribuído a você.
                  </span>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="m-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>Gerencie sua senha e métodos de autenticação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 max-w-md">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid gap-2 max-w-md">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button
                variant="secondary"
                onClick={() => toast({ title: 'Funcionalidade em desenvolvimento' })}
              >
                Atualizar Senha
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
