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
  const { searchQuery, setSearchQuery } = useLeadStore()
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
        return 'Era Digital Vendas'
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
        return 'Era Digital Vendas'
    }
  })()

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 sm:gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <SidebarTrigger className="-ml-2 md:hidden text-foreground" />
      <div className="flex-1 flex items-center justify-between gap-2">
        <Breadcrumb className="hidden sm:block shrink-0">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-lg font-semibold text-foreground">
                {pageTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="sm:hidden font-semibold text-lg text-foreground truncate w-full pl-2">
          {pageTitle}
        </div>

        <div className="flex items-center gap-1 sm:gap-4 flex-1 justify-end">
          {location.pathname === '/vendas' && (
            <>
              <div className="md:hidden">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground h-10 w-10">
                      <Search className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[90vw] p-3 mr-4 mt-2">
                    <div className="relative w-full">
                      <Search className="absolute left-2.5 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar leads..."
                        className="w-full pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="relative w-full max-w-sm hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar leads..."
                  className="w-full pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </>
          )}

          {location.pathname === '/vendas' && <AddLeadModal />}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground transition-colors h-10 w-10 shrink-0"
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
                className="relative text-muted-foreground hover:text-primary transition-colors h-10 w-10 shrink-0"
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
            <PopoverContent
              align="end"
              className="w-[90vw] sm:w-80 p-0 border-border mr-2 sm:mr-0 mt-1"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                <span className="font-semibold text-sm text-foreground">Notificações</span>
                {unreadCount > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
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
                          <span className="text-sm font-semibold text-foreground leading-tight">
                            {n.title}
                          </span>
                          {!n.read && (
                            <div className="h-1.5 w-1.5 bg-primary rounded-full shadow-[0_0_5px_hsl(var(--primary))] shrink-0" />
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground leading-snug">
                          {n.message}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70 mt-1 font-medium">
                          {format(new Date(n.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>
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
                  <span className="text-sm font-medium leading-none max-w-[120px] truncate text-foreground">
                    {userName}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">{role}</span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2 mt-1 mr-2 sm:mr-0">
              <div className="flex flex-col space-y-2 p-3 border-b border-border mb-2">
                <span className="text-sm font-medium text-foreground">{userName}</span>
                <span className="text-xs text-muted-foreground">{role}</span>
              </div>
              <Button variant="ghost" className="w-full justify-start h-11" onClick={toggleRole}>
                <Shield className="w-4 h-4 mr-2 text-muted-foreground" /> Alterar Visão
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-foreground hover:bg-accent hover:text-foreground h-11"
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
