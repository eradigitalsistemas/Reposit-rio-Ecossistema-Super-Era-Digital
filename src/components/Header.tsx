import { useState } from 'react'
import { Search, Bell, Shield, LogOut, Sun, Moon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { AddLeadModal } from './AddLeadModal'
import { GlobalSearch } from './GlobalSearch'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import useLeadStore from '@/stores/useLeadStore'
import useDemandStore from '@/stores/useDemandStore'
import useAuthStore from '@/stores/useAuthStore'
import { useLocation, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useTheme } from 'next-themes'

export function Header() {
  const { notifications, markNotificationsAsRead } = useDemandStore()
  const { role, toggleRole, logout, userName } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const [popoverOpen, setPopoverOpen] = useState(false)

  const pageTitle = (() => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Geral'
      case '/vendas':
        return 'CRM Era Digital'
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
        return 'CRM Era Digital'
    }
  })()

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 sm:gap-4 border-b border-border/50 bg-background/80 glass-optimized px-4 sm:px-6 shadow-sm hardware-accelerated">
      <SidebarTrigger className="-ml-2 md:hidden text-foreground" />
      <div className="flex-1 flex items-center justify-between gap-2">
        <Breadcrumb className="hidden sm:block shrink-0">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xl md:text-2xl font-display font-bold text-slate-900 dark:text-white drop-shadow-sm">
                {pageTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="sm:hidden font-display font-bold text-xl truncate w-full pl-2 text-slate-900 dark:text-white">
          {pageTitle}
        </div>

        <div className="flex items-center gap-1 sm:gap-4 flex-1 justify-end">
          <div className="flex-1 max-w-[150px] sm:max-w-sm ml-auto flex justify-end">
            <GlobalSearch />
          </div>

          {location.pathname === '/vendas' && <AddLeadModal />}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground dark:text-white/70 hover:text-foreground dark:hover:text-white transition-colors h-10 w-10 shrink-0"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Popover
            open={popoverOpen}
            onOpenChange={(open) => {
              setPopoverOpen(open)
              if (!open && unreadCount > 0) markNotificationsAsRead()
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground dark:text-white/70 hover:text-primary dark:hover:text-white transition-colors h-10 w-10 shrink-0"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[90vw] sm:w-80 p-0 border-border mr-2 sm:mr-0 mt-1"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50 dark:bg-muted/30">
                <span className="font-bold text-sm text-foreground dark:text-white">
                  Notificações
                </span>
                {unreadCount > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-accent/10 text-accent-foreground dark:text-accent border-accent/20 font-bold hover:bg-accent/20"
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
                        onClick={() => {
                          if (n.demandId) {
                            navigate(`/demandas?highlight=${n.demandId}`)
                            setPopoverOpen(false)
                            if (unreadCount > 0) markNotificationsAsRead()
                          }
                        }}
                        className={`p-4 border-b border-border last:border-0 flex flex-col gap-1 transition-colors cursor-pointer ${
                          !n.read ? 'bg-muted hover:bg-muted/80' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-foreground dark:text-white leading-tight">
                            {n.title}
                          </span>
                          {!n.read && (
                            <div className="h-1.5 w-1.5 bg-accent rounded-full shadow-[0_0_5px_rgba(var(--accent),0.5)] shrink-0" />
                          )}
                        </div>
                        <span className="text-sm text-foreground/80 dark:text-white/70 leading-snug">
                          {n.message}
                        </span>
                        <span className="text-[10px] text-muted-foreground dark:text-white/50 mt-1 font-semibold">
                          {format(new Date(n.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>{' '}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-6 w-px bg-border hidden sm:block mx-1" />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="px-2 flex items-center gap-2 h-10 hover:bg-accent text-foreground"
              >
                <Avatar className="h-7 w-7 border border-border bg-secondary text-secondary-foreground font-medium text-xs">
                  <AvatarFallback className="bg-transparent text-secondary-foreground">
                    {userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-sm font-medium leading-none max-w-[120px] truncate text-foreground dark:text-white">
                    {userName}
                  </span>
                  <span className="text-[10px] text-muted-foreground dark:text-white/60 mt-1">
                    {role}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-56 p-2 mt-1 mr-2 sm:mr-0 border-border shadow-md"
            >
              <div className="flex flex-col space-y-1 p-3 border-b border-border mb-2 bg-muted/20 dark:bg-muted/30 rounded-t-sm">
                <span className="text-sm font-bold text-foreground dark:text-white">
                  {userName}
                </span>
                <span className="text-xs font-medium text-muted-foreground dark:text-white/60">
                  {role}
                </span>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start h-11 text-foreground/80 dark:text-white/80 hover:text-foreground dark:hover:text-white font-medium"
                onClick={toggleRole}
              >
                <Shield className="w-4 h-4 mr-2 text-foreground/60 dark:text-white/60" /> Alterar
                Visão
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive/80 dark:text-red-400 hover:bg-destructive/10 hover:text-destructive dark:hover:text-red-300 dark:hover:bg-red-950/30 h-11 font-medium mt-1"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" /> Sair
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}
