import { useState, useEffect, useCallback } from 'react'
import { Building2, Loader2, Plus } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { fetchEmpresas, type Empresa } from '@/services/empresas'
import { useToast } from '@/hooks/use-toast'
import { ConstituicaoTab } from '@/components/empresa-tabs/ConstituicaoTab'
import { SSTTab } from '@/components/empresa-tabs/SSTTab'
import { ColaboradoresTab } from '@/components/empresa-tabs/ColaboradoresTab'
import { RescisaoTab } from '@/components/empresa-tabs/RescisaoTab'
import { CertidoesTab } from '@/components/empresa-tabs/CertidoesTab'
import { ValidadesTab } from '@/components/empresa-tabs/ValidadesTab'
import { CompanyDossierButton } from '@/components/empresa-tabs/CompanyDossierButton'
import { Link } from 'react-router-dom'

export default function CompanyDocuments() {
  const { toast } = useToast()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchEmpresas()
      setEmpresas(list)
      if (list.length > 0) setSelectedId(list[0].id)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar empresas.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col flex-1 p-4 sm:p-6 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col flex-1 p-4 sm:p-6 text-foreground relative z-10 overflow-x-hidden">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Empresa
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie documentos de constituição, SST, colaboradores e rescisão.
        </p>
      </div>

      {empresas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Building2 className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">Nenhuma empresa cadastrada</p>
          <p className="text-sm mb-4">Cadastre um cliente externo para começar.</p>
          <Button asChild className="gap-2">
            <Link to="/clientes">
              <Plus className="w-4 h-4" /> Ir para Clientes
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 shrink-0 flex items-center gap-2 flex-wrap">
            <Select value={selectedId || ''} onValueChange={setSelectedId}>
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
            <Tabs defaultValue="constituicao" className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-6 w-full sm:w-auto mb-6">
                <TabsTrigger value="constituicao">Constituição</TabsTrigger>
                <TabsTrigger value="certidoes">Certidões</TabsTrigger>
                <TabsTrigger value="sst">SST</TabsTrigger>
                <TabsTrigger value="colaboradores">Colaboradores</TabsTrigger>
                <TabsTrigger value="rescisao">Rescisão</TabsTrigger>
                <TabsTrigger value="validades">Validades</TabsTrigger>
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
            </Tabs>
          )}
        </>
      )}
    </div>
  )
}
