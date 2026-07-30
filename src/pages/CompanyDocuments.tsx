import { useState, useEffect } from 'react'
import { Building2, Loader2, AlertCircle } from 'lucide-react'
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
import { ConstituicaoTab } from '@/components/empresa-tabs/ConstituicaoTab'
import { SSTTab } from '@/components/empresa-tabs/SSTTab'
import { ColaboradoresTab } from '@/components/empresa-tabs/ColaboradoresTab'
import { CertidoesTab } from '@/components/empresa-tabs/CertidoesTab'
import { ComplianceReportTab } from '@/components/empresa-tabs/ComplianceReportTab'
import { CompanyComplianceProvider, useCompanyCompliance } from '@/hooks/use-company-compliance'
import { CompaniesByServiceChart } from '@/components/compliance/CompaniesByServiceChart'

function CompanyDocumentsContent() {
  const { empresas, loading, error, refresh } = useCompanyCompliance()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('constituicao')

  const urlId = searchParams.get('id')

  useEffect(() => {
    if (urlId && empresas.some((e) => e.id === urlId)) {
      setSelectedId(urlId)
    }
  }, [urlId, empresas])

  const handleSelectCompany = (id: string) => {
    setSelectedId(id)
    setActiveTab('constituicao')
    setSearchParams({ id })
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
      <div className="mb-6 shrink-0 flex items-center gap-2 flex-wrap">
        <Select value={selectedId || ''} onValueChange={(v) => handleSelectCompany(v)}>
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
      </div>

      <CompaniesByServiceChart />
      {selectedId && (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full sm:w-auto mb-6">
              <TabsTrigger value="constituicao">Constituição</TabsTrigger>
              <TabsTrigger value="certidoes">Certidões</TabsTrigger>
              <TabsTrigger value="sst">SST</TabsTrigger>
              <TabsTrigger value="colaboradores">Colaboradores</TabsTrigger>
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
