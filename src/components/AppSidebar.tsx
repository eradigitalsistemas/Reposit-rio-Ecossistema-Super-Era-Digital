import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Building2,
  CheckSquare,
  ExternalLink,
  Settings as SettingsIcon,
  Home,
} from 'lucide-react'
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

const MENU_ITEMS = [
  { title: 'Dashboard Geral', icon: Home, url: '/', roles: ['Admin', 'Colaborador'] },
  {
    title: 'Era Digital Vendas',
    icon: LayoutDashboard,
    url: '/vendas',
    roles: ['Admin', 'Colaborador'],
  },
  { title: 'Demandas', icon: CheckSquare, url: '/demandas', roles: ['Admin', 'Colaborador'] },
  { title: 'Colaboradores', icon: Users, url: '/colaboradores', roles: ['Admin'] },
  { title: 'Clientes Externos', icon: Building2, url: '/clientes', roles: ['Admin'] },
  { title: 'Relatórios', icon: BarChart3, url: '/relatorios', roles: ['Admin'] },
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

  const visibleItems = MENU_ITEMS.filter((item) => item.roles.includes(role as string))

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-border bg-sidebar shrink-0">
        <Link
          to="/"
          onClick={handleLinkClick}
          className="flex items-center gap-2 font-bold text-lg text-sidebar-foreground hover:text-sidebar-foreground/80 transition-colors"
        >
          <div className="p-1 bg-sidebar-accent rounded-md ring-1 ring-sidebar-border">
            <Building2 className="w-5 h-5 text-sidebar-foreground" />
          </div>
          <span>Era Digital</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto bg-sidebar">
        <SidebarGroup>
          <SidebarGroupContent className="py-4">
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname.startsWith(item.url) &&
                      item.url !== '#' &&
                      (item.url === '/' ? location.pathname === '/' : true)
                    }
                    className="transition-all duration-200 h-12 md:h-10 px-4 md:px-2"
                  >
                    <Link
                      to={item.url}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-base md:text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border shrink-0 mt-auto pb-8 md:pb-4 bg-sidebar">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              variant="outline"
              className="w-full justify-center text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent transition-colors h-12 md:h-10"
            >
              <Link
                to="/portal/login"
                onClick={handleLinkClick}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-5 h-5 md:w-4 md:h-4" />
                <span className="text-base md:text-sm font-medium">Portal do Cliente</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
