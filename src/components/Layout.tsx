import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import useAuthStore from '@/stores/useAuthStore'
import { useEffect } from 'react'

export default function Layout() {
  const { role, setRole } = useAuthStore()
  const location = useLocation()

  // Protect internal CRM from Client users
  if (role === 'Client') {
    return <Navigate to="/portal/demandas" replace />
  }

  // Auto-login to Admin if role is completely null and they try to hit CRM
  // (Provides a smoother demo experience if they log out of the portal and go to root)
  useEffect(() => {
    if (role === null && !location.pathname.startsWith('/portal')) {
      setRole('Admin')
    }
  }, [role, setRole, location.pathname])

  if (role === null) return null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-background">
        <Header />
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
