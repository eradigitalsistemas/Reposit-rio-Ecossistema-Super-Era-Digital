import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, BarChart3, Settings, Building2 } from 'lucide-react'
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
} from '@/components/ui/sidebar'

const MENU_ITEMS = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '/' },
  { title: 'Clientes', icon: Users, url: '#' },
  { title: 'Relatórios', icon: BarChart3, url: '#' },
  { title: 'Configurações', icon: Settings, url: '#' },
]

export function AppSidebar() {
  const location = useLocation()

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
              {MENU_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
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
    </Sidebar>
  )
}
