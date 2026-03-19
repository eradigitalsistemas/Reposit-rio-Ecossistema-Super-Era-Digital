import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Building2,
  CheckSquare,
  ExternalLink,
  Settings as SettingsIcon,
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
} from '@/components/ui/sidebar'
import useAuthStore from '@/stores/useAuthStore'

const MENU_ITEMS = [
  { title: 'CRM', icon: LayoutDashboard, url: '/', roles: ['Admin', 'Colaborador'] },
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

  const visibleItems = MENU_ITEMS.filter((item) => item.roles.includes(role as string))

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center px-6 border-b">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Building2 className="w-6 h-6" />
          <span>CRM Pro</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
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
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              variant="outline"
              className="w-full justify-center text-primary border-primary/20 hover:bg-primary/5"
            >
              <Link to="/portal/login" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <span>Portal do Cliente</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
