import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { Building2, LogOut, FileText, CheckSquare } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function PortalLayout() {
  const { role, userName, logout } = useAuthStore()
  const location = useLocation()

  if (role !== 'Client') {
    return <Navigate to="/portal/login" replace />
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const navItems = [
    { name: 'Minhas Demandas', path: '/portal/demandas', icon: CheckSquare },
    { name: 'Meus Documentos', path: '/portal/documentos', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
        <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-6">
          <div className="flex items-center gap-6 md:gap-10">
            <div className="flex items-center gap-2 font-bold text-lg text-primary">
              <Building2 className="w-6 h-6" />
              <span className="hidden sm:inline-block">Portal do Cliente</span>
            </div>

            <nav className="flex items-center gap-1 md:gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    location.pathname.startsWith(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden md:inline-block">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-sm">
              <span className="font-semibold leading-none">{userName}</span>
              <span className="text-xs text-muted-foreground">Área do Cliente</span>
            </div>
            <Avatar className="h-9 w-9 border border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline-block">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
