import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import useAuthStore from '@/stores/useAuthStore'
import { Loader2 } from 'lucide-react'

export default function Layout() {
  const { role, loading, user } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Protect internal CRM
  if (!user && role !== 'Client') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Protect internal CRM from Client users
  if (role === 'Client') {
    return <Navigate to="/portal/demandas" replace />
  }

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
