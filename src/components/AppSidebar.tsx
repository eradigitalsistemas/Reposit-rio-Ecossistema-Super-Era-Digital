import { Link, useLocation } from 'react-router-dom'
import logoUrl from '@/assets/logo-principal-sem-fundo-f3fe7.png'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Building2,
  CheckSquare,
  Calendar,
  ExternalLink,
  Settings as SettingsIcon,
  FileText,
  Home,
  UserPlus,
  Clock,
  Briefcase,
  UserCog,
  MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import useAuthStore from '@/stores/useAuthStore'

const MAIN_MENU = [
  { title: 'Dashboard Geral', icon: Home, url: '/', roles: ['Admin', 'Colaborador'] },
  { title: 'WhatsApp', icon: MessageCircle, url: '/whatsapp', roles: ['Admin', 'Colaborador'] },
  {
    title: 'Era Digital Vendas',
    icon: LayoutDashboard,
    url: '/vendas',
    roles: ['Admin', 'Colaborador'],
  },
  {
    title: 'Protocolos Certificados',
    icon: FileText,
    url: '/certificados',
    roles: ['Admin', 'Colaborador'],
  },
  { title: 'Demandas', icon: CheckSquare, url: '/demandas', roles: ['Admin', 'Colaborador'] },
  { title: 'Agenda', icon: Calendar, url: '/agenda', roles: ['Admin', 'Colaborador'] },
  { title: 'Clientes Externos', icon: Building2, url: '/clientes', roles: ['Admin'] },
]

const HR_MENU = [
  { title: 'Central RH', icon: Briefcase, url: '/rh', roles: ['Admin'] },
  { title: 'Funcionários (RH)', icon: Users, url: '/funcionarios', roles: ['Admin'] },
  { title: 'Banco de Talentos', icon: UserPlus, url: '/talentos', roles: ['Admin'] },
  { title: 'Admissão & Onboarding', icon: UserPlus, url: '/onboarding', roles: ['Admin'] },
  { title: 'Meu Ponto & Férias', icon: Clock, url: '/meu-ponto', roles: ['Admin', 'Colaborador'] },
  { title: 'Relatórios RH', icon: BarChart3, url: '/relatorios', roles: ['Admin'] },
]

const SYS_MENU = [
  {
    title: 'Colaboradores',
    icon: UserCog,
    url: '/colaboradores',
    roles: ['Admin'],
  },
  {
    title: 'Configurações',
    icon: SettingsIcon,
    url: '/configuracoes',
    roles: ['Admin', 'Colaborador'],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { role } = useAuthStore()
  const { setOpenMobile, isMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const renderMenu = (items: typeof MAIN_MENU) => {
    const visibleItems = items.filter((item) =>
      item.roles.some((r) => r.toLowerCase() === (role as string)?.toLowerCase()),
    )
    if (visibleItems.length === 0) return null

    return (
      <SidebarMenu className="space-y-1.5 px-2">
        {visibleItems.map((item) => {
          const isActive =
            location.pathname.startsWith(item.url) &&
            item.url !== '#' &&
            (item.url === '/' ? location.pathname === '/' : true)
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className={cn(
                  'transition-[transform,opacity,background-color,color,box-shadow] duration-300 h-11 md:h-10 px-4 md:px-3 rounded-xl group relative overflow-hidden border border-transparent',
                  isActive
                    ? 'bg-primary/10 text-primary dark:text-white border-primary/30 dark:border-primary/50 shadow-[0_0_15px_rgba(34,197,94,0.15)] dark:shadow-[0_0_20px_rgba(34,197,94,0.25)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/20 before:to-transparent before:opacity-100'
                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/70 dark:text-white/70 hover:text-sidebar-foreground dark:hover:text-white hover:border-border/50',
                )}
              >
                <Link
                  to={item.url}
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 font-medium relative z-10"
                >
                  <item.icon
                    className={cn(
                      'w-5 h-5 transition-all duration-300',
                      isActive
                        ? 'opacity-100 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                        : 'opacity-80 group-hover:scale-110',
                    )}
                  />
                  <span className="text-base md:text-sm font-display font-semibold">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    )
  }

  const hrItemsVisible =
    HR_MENU.filter((i) => i.roles.some((r) => r.toLowerCase() === (role as string)?.toLowerCase()))
      .length > 0

  return (
    <Sidebar className="glass-optimized bg-sidebar/80 border-r border-border/50 shadow-md hardware-accelerated">
      <SidebarHeader className="py-6 flex items-center px-6 border-b border-border/30 bg-transparent shrink-0">
        <Link
          to="/"
          onClick={handleLinkClick}
          className="flex items-center gap-3 font-bold text-xl text-sidebar-foreground dark:text-white hover:text-sidebar-foreground/80 transition-colors"
        >
          <img
            src={logoUrl}
            alt="Era Digital Logo"
            className="w-32 h-32 object-contain shrink-0 drop-shadow-[0_0_10px_rgba(34,197,94,0.2)]"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto bg-transparent hide-scrollbar px-2">
        <SidebarGroup>
          <div className="px-4 py-2 mt-2 text-[10px] font-display font-bold text-sidebar-foreground/40 dark:text-white/50 uppercase tracking-widest">
            Principal
          </div>
          <SidebarGroupContent>{renderMenu(MAIN_MENU)}</SidebarGroupContent>
        </SidebarGroup>

        {hrItemsVisible && (
          <SidebarGroup>
            <div className="px-4 py-2 mt-4 text-[10px] font-display font-bold text-sidebar-foreground/40 dark:text-white/50 uppercase tracking-widest">
              Recursos Humanos
            </div>{' '}
            <SidebarGroupContent>{renderMenu(HR_MENU)}</SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <div className="px-4 py-2 mt-4 text-[10px] font-display font-bold text-sidebar-foreground/40 dark:text-white/50 uppercase tracking-widest">
            Sistema
          </div>
          <SidebarGroupContent>{renderMenu(SYS_MENU)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t-0 shrink-0 mt-auto pb-8 md:pb-4 bg-transparent relative z-10 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-border dark:before:via-primary/30 before:to-transparent">
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              variant="outline"
              className="w-full justify-center text-sidebar-foreground dark:text-white border-border/50 hover:bg-sidebar-accent/50 hover:border-primary/50 dark:hover:border-primary/50 hover:text-primary dark:hover:text-white transition-colors h-12 md:h-10 rounded-xl"
            >
              <Link
                to="/portal/login"
                onClick={handleLinkClick}
                className="flex items-center gap-2 w-full justify-center font-bold"
              >
                <ExternalLink className="w-5 h-5 md:w-4 md:h-4 opacity-80 text-accent" />
                <span className="text-base md:text-sm">Portal do Cliente</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
