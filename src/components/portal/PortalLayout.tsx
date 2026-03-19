import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { Building2, LogOut, FileText, CheckSquare, Menu } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState } from 'react'

export default function PortalLayout() {
  const { role, userName, logout } = useAuthStore()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

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
          <div className="flex items-center gap-3 md:gap-10">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-primary shrink-0 -ml-2"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="text-left p-6 border-b">
                  <SheetTitle className="flex items-center gap-2 text-primary font-bold">
                    <Building2 className="w-6 h-6" />
                    Portal do Cliente
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 p-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors',
                        location.pathname.startsWith(item.path)
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  <div className="h-px bg-border my-2" />
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                    className="justify-start px-4 py-3 h-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair da conta</span>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2 font-bold text-lg text-primary">
              <Building2 className="w-6 h-6 hidden sm:block" />
              <span className="hidden sm:inline-block">Portal do Cliente</span>
              <span className="sm:hidden ml-1">Portal</span>
            </div>

            <nav className="hidden md:flex items-center gap-2">
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
                  <span>{item.name}</span>
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
            <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="hidden sm:flex text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
