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
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90 opacity-90"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.04] mix-blend-screen"></div>
        <div
          className="absolute top-[-10%] right-[-10%] w-[60vw] h-[600px] rounded-full mix-blend-screen pointer-events-none transform-gpu"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, transparent 70%)',
          }}
        ></div>
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[700px] rounded-full mix-blend-screen pointer-events-none transform-gpu"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
          }}
        ></div>
      </div>
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 min-h-[100dvh] bg-transparent isolate relative hardware-accelerated w-full">
        <div className="flex-shrink-0 z-50 sticky top-0 [&>header]:!bg-transparent [&>header]:backdrop-blur-none bg-background/70 glass-optimized border-b border-border/30 w-full">
          <Header />
        </div>
        <main className="flex-1 relative flex flex-col z-0 w-full overflow-x-hidden">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
