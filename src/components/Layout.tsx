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
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute inset-0 bg-background"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[500px] bg-[#0070f3]/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      </div>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-[100dvh] bg-transparent w-full max-w-[100vw] overflow-hidden">
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
