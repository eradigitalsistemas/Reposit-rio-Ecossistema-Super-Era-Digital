import { useState, useEffect } from 'react'
import { Building2, Loader2, Plus, LayoutGrid, AlertCircle } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'react-router-dom'
import { CompanyComplianceDashboard } from '@/components/empresa-tabs/CompanyComplianceDashboard'
import { NewCompanyCnpjDialog } from '@/components/empresa-tabs/NewCompanyCnpjDialog'
import { ConstituicaoTab } from '@/components/empresa-tabs/ConstituicaoTab'
import { SSTTab } from '@/components/empresa-tabs/SSTTab'
import { ColaboradoresTab } from '@/components/empresa-tabs/ColaboradoresTab'
import { RescisaoTab } from '@/components/empresa-tabs/RescisaoTab'
import { CertidoesTab } from '@/components/empresa-tabs/CertidoesTab'
import { ValidadesTab } from '@/components/empresa-tabs/ValidadesTab'
import { ComplianceReportTab } from '@/components/empresa-tabs/ComplianceReportTab'
import { CompanyDossierButton } from '@/components/empresa-tabs/CompanyDossierButton'
import { CompliancePieChart } from '@/components/empresa-tabs/CompliancePieChart'
import { CompanyComplianceProvider, useCompanyCompliance } from '@/hooks/use-company-compliance'

function CompanyDocumentsContent() {
  const { empresas, loading, error, refresh } = useCompanyCompliance()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('constituicao')
  const [view, setView] = useState<'dashboard' | 'detail'>('dashboard')
  const [newCompanyOpen, setNewCompanyOpen] = useState(false)

  const urlId = searchParams.get('id')

  useEffect(() => {
    if (urlId && empresas.some((e) => e.id === urlId)) {
      setSelectedId(urlId)
      setView('detail')
    }
  }, [urlId, empresas])

  const handleSelectCompany = (id: string) => {
    setSelectedId(id)
    setView('detail')
    setActiveTab('constituicao')
    setSearchParams({ id })
  }

  const handleBackToDashboard = () => {
    setView('dashboard')
    setSelectedId(null)
    setSearchParams({})
  }

  const handleCompanyCreated = async (id: string) => {
    await refresh()
    handleSelectCompany(id)
  }

  const selectedEmpresa = empresas.find((e) => e.id === selectedId)

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col flex-1 p-4 sm:p-6 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col flex-1 p-4 sm:p-6 items-center justify-center">
        <AlertCircle className="w-10 h-10 mb-3 text-destructive" />
        <p className="text-sm mb-3 text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={refresh}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col flex-1 p-4 sm:p-6 text-foreground relative z-10 overflow-x-hidden">
      <div className="mb-6 shrink-0 flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Empresa
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {view === 'dashboard'
              ? 'Visão geral de conformidade de todas as empresas.'
              : 'Gerencie documentos de constituição, SST, colaboradores e rescisão.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {view === 'detail' && (
            <Button variant="outline" className="gap-1.5" onClick={handleBackToDashboard}>
              <LayoutGrid className="w-4 h-4" /> Visão Geral
            </Button>
          )}
          <Button className="gap-1.5" onClick={() => setNewCompanyOpen(true)}>
            <Plus className="w-4 h-4" /> Nova Empresa
          </Button>
        </div>
      </div>

      {empresas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Building2 className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">Nenhuma empresa cadastrada</p>
          <p className="text-sm mb-4">Clique em "Nova Empresa" para começar.</p>
        </div>
      ) : view === 'dashboard' ? (
        <CompanyComplianceDashboard onSelectCompany={handleSelectCompany} />
      ) : (
        <>
          <div className="mb-6 shrink-0 flex items-center gap-2 flex-wrap">
            <Select
              value={selectedId || ''}
              onValueChange={(v) => {
                setSelectedId(v)
                setSearchParams({ id: v })
              }}
            >
              <SelectTrigger className="w-full sm:w-[400px]">
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome || e.empresa || 'Sem nome'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedId && <CompanyDossierButton empresaId={selectedId} />}
          </div>

          {selectedId && (
            <>
              <CompliancePieChart empresaId={selectedId} />
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 sm:grid-cols-7 w-full sm:w-auto mb-6">
                  <TabsTrigger value="constituicao">Constituição</TabsTrigger>
                  <TabsTrigger value="certidoes">Certidões</TabsTrigger>
                  <TabsTrigger value="sst">SST</TabsTrigger>
                  <TabsTrigger value="colaboradores">Colaboradores</TabsTrigger>
                  <TabsTrigger value="rescisao">Rescisão</TabsTrigger>
                  <TabsTrigger value="validades">Validades</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>
                <TabsContent value="constituicao" className="mt-0">
                  <ConstituicaoTab empresaId={selectedId} />
                </TabsContent>
                <TabsContent value="certidoes" className="mt-0">
                  <CertidoesTab empresaId={selectedId} />
                </TabsContent>
                <TabsContent value="sst" className="mt-0">
                  <SSTTab empresaId={selectedId} />
                </TabsContent>
                <TabsContent value="colaboradores" className="mt-0">
                  <ColaboradoresTab empresaId={selectedId} />
                </TabsContent>
                <TabsContent value="rescisao" className="mt-0">
                  <RescisaoTab empresaId={selectedId} />
                </TabsContent>
                <TabsContent value="validades" className="mt-0">
                  <ValidadesTab empresaId={selectedId} />
                </TabsContent>
                <TabsContent value="compliance" className="mt-0">
                  <ComplianceReportTab
                    empresaId={selectedId}
                    empresaNome={selectedEmpresa?.nome || selectedEmpresa?.empresa || ''}
                    empresaCnpj={selectedEmpresa?.cnpj || null}
                    onNavigateTab={setActiveTab}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </>
      )}

      <NewCompanyCnpjDialog
        open={newCompanyOpen}
        onOpenChange={setNewCompanyOpen}
        onCreated={handleCompanyCreated}
      />
    </div>
  )
}

export default function CompanyDocuments() {
  return (
    <CompanyComplianceProvider>
      <CompanyDocumentsContent />
    </CompanyComplianceProvider>
  )
}
