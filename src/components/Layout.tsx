import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import useAuthStore from '@/stores/useAuthStore'
import { Loader2 } from 'lucide-react'
import { ErrorBoundary } from './ErrorBoundary'

export default function Layout() {
  const { role, loading, user } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background w-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
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
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-gradient-to-br from-background to-background/95">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] mix-blend-screen"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[500px] bg-accent/15 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[600px] bg-primary/15 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      </div>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-[100dvh] bg-transparent w-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full flex flex-col">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
