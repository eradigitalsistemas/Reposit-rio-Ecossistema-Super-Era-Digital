import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Vendas from './pages/Vendas'
import Login from './pages/Login'
import Demands from './pages/Demands'
import Clients from './pages/Clients'
import ClientProfile from './pages/ClientProfile'
import Collaborators from './pages/Collaborators'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
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
                  <Routes>
                    {/* Public Auth Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Internal CRM Routes */}
                    <Route element={<Layout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/vendas" element={<Vendas />} />
                      <Route path="/demandas" element={<Demands />} />
                      <Route path="/clientes" element={<Clients />} />
                      <Route path="/clientes/:id" element={<ClientProfile />} />
                      <Route path="/colaboradores" element={<Collaborators />} />
                      <Route path="/relatorios" element={<Reports />} />
                      <Route path="/configuracoes" element={<Settings />} />
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
