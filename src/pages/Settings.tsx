import { useState, useEffect } from 'react'
import { User, Bell, Shield, Save, Loader2, Link as LinkIcon } from 'lucide-react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export default function Settings() {
  const { user, userName, role } = useAuthStore()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [whatsappProvider, setWhatsappProvider] = useState('evolution')
  const [uazapiKey, setUazapiKey] = useState('')
  const [evolutionApiUrl, setEvolutionApiUrl] = useState('')
  const [evolutionApiKey, setEvolutionApiKey] = useState('')
  const [evolutionInstance, setEvolutionInstance] = useState('')
  const [isSavingIntegrations, setIsSavingIntegrations] = useState(false)

  const [agendaAlerts, setAgendaAlerts] = useState(() => {
    const saved = localStorage.getItem('agenda_alerts_enabled')
    return saved !== null ? saved === 'true' : true
  })

  useEffect(() => {
    if (userName) setName(userName)
    if (user?.email) setEmail(user.email)

    const fetchSettings = async () => {
      const { data } = await supabase
        .from('configuracoes')
        .select('chave, valor')
        .in('chave', [
          'whatsapp_provider',
          'uazapi_key',
          'evolution_api_url',
          'evolution_api_key',
          'evolution_instance',
        ])
      if (data) {
        data.forEach((item) => {
          if (item.chave === 'whatsapp_provider') setWhatsappProvider(item.valor)
          if (item.chave === 'uazapi_key') setUazapiKey(item.valor)
          if (item.chave === 'evolution_api_url') setEvolutionApiUrl(item.valor)
          if (item.chave === 'evolution_api_key') setEvolutionApiKey(item.valor)
          if (item.chave === 'evolution_instance') setEvolutionInstance(item.valor)
        })
      }
    }
    fetchSettings()
  }, [userName, user])

  const handleToggleAgendaAlerts = (checked: boolean) => {
    setAgendaAlerts(checked)
    localStorage.setItem('agenda_alerts_enabled', String(checked))
  }

  const handleSaveIntegrations = async () => {
    if (!user) return
    setIsSavingIntegrations(true)
    try {
      const configs = [
        { chave: 'whatsapp_provider', valor: whatsappProvider },
        { chave: 'uazapi_key', valor: uazapiKey },
        { chave: 'evolution_api_url', valor: evolutionApiUrl },
        { chave: 'evolution_api_key', valor: evolutionApiKey },
        { chave: 'evolution_instance', valor: evolutionInstance },
      ].map((c) => ({
        ...c,
        atualizado_por: user.id,
        atualizado_em: new Date().toISOString(),
      }))

      const { error } = await supabase.from('configuracoes').upsert(configs)
      if (error) throw error
      toast({
        title: 'Integrações atualizadas',
        description: 'Suas configurações de API foram salvas com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações. Verifique suas permissões.',
        variant: 'destructive',
      })
    } finally {
      setIsSavingIntegrations(false)
    }
  }

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
    <div className="h-full w-full bg-background flex flex-col p-4 sm:p-6 overflow-y-auto text-foreground">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-foreground">
          Configurações
        </h1>
        <p className="text-gray-600 dark:text-muted-foreground text-sm mt-1">
          Gerencie as preferências da sua conta e do sistema.
        </p>
      </div>

      <Tabs defaultValue="profile" className="flex-1 flex flex-col max-w-4xl">
        <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto min-h-[48px] p-0 space-x-2 sm:space-x-6 shrink-0 mb-6 overflow-x-auto flex-nowrap hide-scrollbar">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-gray-600 dark:text-muted-foreground rounded-none min-h-[48px] px-2 sm:px-0 gap-2 whitespace-nowrap transition-colors"
          >
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-gray-600 dark:text-muted-foreground rounded-none min-h-[48px] px-2 sm:px-0 gap-2 whitespace-nowrap transition-colors"
          >
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-gray-600 dark:text-muted-foreground rounded-none min-h-[48px] px-2 sm:px-0 gap-2 whitespace-nowrap transition-colors"
          >
            <Shield className="w-4 h-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-gray-600 dark:text-muted-foreground rounded-none min-h-[48px] px-2 sm:px-0 gap-2 whitespace-nowrap transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="m-0 space-y-6">
          <Card className="border-0 sm:border border-gray-300 dark:border-border bg-transparent sm:bg-white sm:dark:bg-card shadow-none sm:shadow-md sm:dark:shadow-sm">
            <CardHeader className="px-0 sm:px-6">
              <CardTitle className="text-gray-900 dark:text-foreground">
                Informações Pessoais
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-muted-foreground">
                Atualize seus dados básicos e como você é visto no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-0 sm:px-6">
              <div className="grid gap-2 w-full max-w-md">
                <Label htmlFor="name" className="text-gray-900 dark:text-foreground">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div className="grid gap-2 w-full max-w-md">
                <Label htmlFor="email" className="text-gray-900 dark:text-foreground">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-100 dark:bg-muted opacity-60"
                />
                <p className="text-[10px] text-gray-500 dark:text-muted-foreground">
                  O e-mail não pode ser alterado por aqui.
                </p>
              </div>
              <div className="grid gap-2 w-full max-w-md">
                <Label className="text-gray-900 dark:text-foreground">Perfil de Acesso</Label>
                <Input
                  value={role || ''}
                  disabled
                  className="bg-gray-100 dark:bg-muted opacity-60 capitalize"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-200 dark:border-border px-0 sm:px-6 py-4 mt-4">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full sm:w-auto gap-2"
              >
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
          <Card className="border-0 sm:border border-gray-300 dark:border-border bg-transparent sm:bg-white sm:dark:bg-card shadow-none sm:shadow-md sm:dark:shadow-sm">
            <CardHeader className="px-0 sm:px-6">
              <CardTitle className="text-gray-900 dark:text-foreground">
                Preferências de Notificação
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-muted-foreground">
                Escolha como deseja ser avisado sobre atualizações importantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-0 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col space-y-1">
                  <Label className="text-gray-900 dark:text-foreground">
                    Notificações por E-mail
                  </Label>
                  <span className="text-sm text-gray-500 dark:text-muted-foreground">
                    Receba resumos diários e alertas de demandas urgentes.
                  </span>
                </div>
                <Switch defaultChecked className="self-end sm:self-auto" />
              </div>
              <div className="w-full h-px bg-gray-200 dark:bg-border sm:hidden" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col space-y-1">
                  <Label className="text-gray-900 dark:text-foreground">
                    Notificações no Navegador (Push)
                  </Label>
                  <span className="text-sm text-gray-500 dark:text-muted-foreground">
                    Seja avisado instantaneamente quando algo for atribuído a você.
                  </span>
                </div>
                <Switch defaultChecked className="self-end sm:self-auto" />
              </div>
              <div className="w-full h-px bg-gray-200 dark:bg-border sm:hidden" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col space-y-1">
                  <Label className="text-gray-900 dark:text-foreground font-bold">
                    Alertas de Agenda (Eventos e Tarefas)
                  </Label>
                  <span className="text-sm text-gray-500 dark:text-muted-foreground">
                    Receba pop-ups e alertas sonoros no momento exato dos seus compromissos.
                  </span>
                </div>
                <Switch
                  checked={agendaAlerts}
                  onCheckedChange={handleToggleAgendaAlerts}
                  className="self-end sm:self-auto"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="m-0 space-y-6">
          <Card className="border-0 sm:border border-gray-300 dark:border-border bg-transparent sm:bg-white sm:dark:bg-card shadow-none sm:shadow-md sm:dark:shadow-sm">
            <CardHeader className="px-0 sm:px-6">
              <CardTitle className="text-gray-900 dark:text-foreground">
                Segurança da Conta
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-muted-foreground">
                Gerencie sua senha e métodos de autenticação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-0 sm:px-6">
              <div className="grid gap-2 w-full max-w-md">
                <Label htmlFor="current-password" className="text-gray-900 dark:text-foreground">
                  Senha Atual
                </Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid gap-2 w-full max-w-md">
                <Label htmlFor="new-password" className="text-gray-900 dark:text-foreground">
                  Nova Senha
                </Label>
                <Input id="new-password" type="password" />
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-200 dark:border-border px-0 sm:px-6 py-4 mt-4">
              <Button
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                onClick={() => toast({ title: 'Funcionalidade em desenvolvimento' })}
              >
                Atualizar Senha
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="m-0 space-y-6">
          <Card className="border-0 sm:border border-gray-300 dark:border-border bg-transparent sm:bg-white sm:dark:bg-card shadow-none sm:shadow-md sm:dark:shadow-sm">
            <CardHeader className="px-0 sm:px-6">
              <CardTitle className="text-gray-900 dark:text-foreground">
                Integrações de API
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-muted-foreground">
                Conecte serviços externos como o WhatsApp para habilitar funcionalidades no sistema.
                Escolha o seu provedor favorito.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-0 sm:px-6">
              <div className="grid gap-4 w-full max-w-md mb-2">
                <Label className="text-gray-900 dark:text-foreground text-base font-semibold">
                  Provedor de WhatsApp
                </Label>
                <RadioGroup
                  value={whatsappProvider}
                  onValueChange={setWhatsappProvider}
                  className="flex flex-col space-y-2 mt-1"
                >
                  <div className="flex items-center space-x-2 border p-3 rounded-lg border-border">
                    <RadioGroupItem value="uazapi" id="uazapi" />
                    <Label htmlFor="uazapi" className="flex-1 cursor-pointer">
                      Uazapi
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-lg border-border">
                    <RadioGroupItem value="evolution" id="evolution" />
                    <Label htmlFor="evolution" className="flex-1 cursor-pointer">
                      Evolution API
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {whatsappProvider === 'uazapi' && (
                <div className="grid gap-2 w-full max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="uazapi-key" className="text-gray-900 dark:text-foreground">
                    Chave de API Uazapi
                  </Label>
                  <Input
                    id="uazapi-key"
                    type="password"
                    value={uazapiKey}
                    onChange={(e) => setUazapiKey(e.target.value)}
                    placeholder="Cole sua API Key aqui..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Esta chave será usada para enviar mensagens e buscar o histórico de conversas no
                    painel.
                  </p>
                </div>
              )}

              {whatsappProvider === 'evolution' && (
                <div className="grid gap-4 w-full max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid gap-2">
                    <Label htmlFor="evo-url">URL da API</Label>
                    <Input
                      id="evo-url"
                      value={evolutionApiUrl}
                      onChange={(e) => setEvolutionApiUrl(e.target.value)}
                      placeholder="Ex: https://evo.dominio.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="evo-key">Global API Key</Label>
                    <Input
                      id="evo-key"
                      type="password"
                      value={evolutionApiKey}
                      onChange={(e) => setEvolutionApiKey(e.target.value)}
                      placeholder="Sua API Key Global..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="evo-instance">Nome da Instância</Label>
                    <Input
                      id="evo-instance"
                      value={evolutionInstance}
                      onChange={(e) => setEvolutionInstance(e.target.value)}
                      placeholder="Ex: kanban_vendas"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      A instância que já está conectada no painel da Evolution.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-gray-200 dark:border-border px-0 sm:px-6 py-4 mt-4">
              <Button
                onClick={handleSaveIntegrations}
                disabled={isSavingIntegrations}
                className="w-full sm:w-auto gap-2"
              >
                {isSavingIntegrations ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
