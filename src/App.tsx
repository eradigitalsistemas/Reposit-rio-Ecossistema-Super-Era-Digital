import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Demands from './pages/Demands'
import Clients from './pages/Clients'
import ClientProfile from './pages/ClientProfile'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { LeadProvider } from './stores/useLeadStore'
import { DemandProvider } from './stores/useDemandStore'
import { ClientProvider } from './stores/useClientStore'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ClientProvider>
        <LeadProvider>
          <DemandProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/demandas" element={<Demands />} />
                <Route path="/clientes" element={<Clients />} />
                <Route path="/clientes/:id" element={<ClientProfile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DemandProvider>
        </LeadProvider>
      </ClientProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
