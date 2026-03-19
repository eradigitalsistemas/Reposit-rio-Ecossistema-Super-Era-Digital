import { Search, Bell, Shield, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { AddLeadModal } from './AddLeadModal'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import useLeadStore from '@/stores/useLeadStore'
import useDemandStore from '@/stores/useDemandStore'
import useAuthStore from '@/stores/useAuthStore'
import { useLocation } from 'react-router-dom'
import { format } from 'date-fns'

export function Header() {
  const { searchQuery, setSearchQuery } = useLeadStore()
  const { notifications, markNotificationsAsRead } = useDemandStore()
  const { role, toggleRole, logout, userName } = useAuthStore()
  const location = useLocation()

  const pageTitle = (() => {
    switch (location.pathname) {
      case '/demandas':
        return 'Gestão de Demandas'
      case '/colaboradores':
        return 'Gestão de Colaboradores'
      case '/clientes':
        return 'Clientes Externos'
      case '/relatorios':
        return 'Relatórios e Métricas'
      case '/configuracoes':
        return 'Configurações'
      default:
        return 'Pipeline de Vendas'
    }
  })()

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-6">
      <SidebarTrigger className="-ml-2 md:hidden" />
      <div className="flex-1 flex items-center justify-between">
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-lg font-semibold">{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4 flex-1 justify-end">
          {location.pathname === '/' && (
            <div className="relative w-full max-w-sm hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar leads..."
                className="w-full bg-muted/50 pl-9 border-border focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          {location.pathname === '/' && <AddLeadModal />}

          <Button
            variant="outline"
            size="sm"
            onClick={toggleRole}
            className="hidden sm:flex items-center gap-2 border-primary/20 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
          >
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-medium">{role}</span>
          </Button>

          <Popover
            onOpenChange={(open) => {
              if (!open && unreadCount > 0) markNotificationsAsRead()
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-primary transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 border-border">
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <span className="font-semibold text-sm text-foreground">Notificações</span>
                {unreadCount > 0 && (
                  <Badge
                    variant="default"
                    className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                  >
                    {unreadCount} não lidas
                  </Badge>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Nenhuma notificação recebida.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 border-b border-border/50 last:border-0 flex flex-col gap-1 transition-colors ${
                          !n.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground leading-tight">
                            {n.title}
                          </span>
                          {!n.read && (
                            <div className="h-1.5 w-1.5 bg-primary rounded-full shadow-[0_0_5px_rgba(34,197,94,0.8)] shrink-0" />
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground leading-snug">
                          {n.message}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 mt-1 font-medium">
                          {format(new Date(n.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:block">{userName}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
