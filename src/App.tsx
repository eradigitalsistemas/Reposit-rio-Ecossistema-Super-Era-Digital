import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Vendas from './pages/Vendas'
import Login from './pages/Login'
import Demands from './pages/Demands'
import Agenda from './pages/Agenda'
import Clients from './pages/Clients'
import ClientProfile from './pages/ClientProfile'
import Collaborators from './pages/Collaborators'
import Employees from './pages/Employees'
import TalentBank from './pages/TalentBank'
import Onboarding from './pages/Onboarding'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import MeuPonto from './pages/MeuPonto'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

import PortalLogin from './pages/portal/PortalLogin'
import PortalLayout from './components/portal/PortalLayout'
import PortalDemands from './pages/portal/PortalDemands'
import PortalDocuments from './pages/portal/PortalDocuments'

import { LeadProvider } from './stores/useLeadStore'
import { DemandProvider } from './stores/useDemandStore'
import { ClientProvider } from './stores/useClientStore'
import { AuthProvider } from './stores/useAuthStore'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './components/ThemeProvider'
import { GlobalNotifications } from './components/GlobalNotifications'

// Força Bruta: Bloquear eventos de foco/visibilidade globais que causam perda de dados em re-renders
if (typeof window !== 'undefined') {
  const originalWinAdd = window.addEventListener
  window.addEventListener = function (type: string, listener: any, options?: any) {
    if (type === 'focus' || type === 'blur') return
    return originalWinAdd.call(window, type, listener, options)
  }
}
if (typeof document !== 'undefined') {
  const originalDocAdd = document.addEventListener
  document.addEventListener = function (type: string, listener: any, options?: any) {
    if (type === 'visibilitychange') return
    return originalDocAdd.call(document, type, listener, options)
  }
}

const App = () => (
  <ErrorBoundary>
    <ThemeProvider defaultTheme="dark" storageKey="era-digital-theme" attribute="class">
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ClientProvider>
              <LeadProvider>
                <DemandProvider>
                  <GlobalNotifications />
                  <Routes>
                    {/* Public Auth Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Internal CRM Routes */}
                    <Route element={<Layout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/vendas" element={<Vendas />} />
                      <Route path="/demandas" element={<Demands />} />
                      <Route path="/agenda" element={<Agenda />} />
                      <Route path="/clientes" element={<Clients />} />
                      <Route path="/clientes/:id" element={<ClientProfile />} />
                      <Route path="/colaboradores" element={<Collaborators />} />
                      <Route path="/funcionarios" element={<Employees />} />
                      <Route path="/talentos" element={<TalentBank />} />
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="/relatorios" element={<Reports />} />
                      <Route path="/configuracoes" element={<Settings />} />
                      <Route path="/meu-ponto" element={<MeuPonto />} />
                    </Route>

                    {/* External Portal Routes */}
                    <Route path="/portal/login" element={<PortalLogin />} />
                    <Route path="/portal" element={<PortalLayout />}>
                      <Route index element={<Navigate to="/portal/demandas" replace />} />
                      <Route path="demandas" element={<PortalDemands />} />
                      <Route path="documentos" element={<PortalDocuments />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </DemandProvider>
              </LeadProvider>
            </ClientProvider>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </ErrorBoundary>
)

export default App
