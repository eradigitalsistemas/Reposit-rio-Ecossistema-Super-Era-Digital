import { useState } from 'react'
import { X, FileText } from 'lucide-react'
import { exportDetailedPDF } from '@/utils/export'

export function CrmExportModal({ rawData, onClose }: { rawData: any; onClose: () => void }) {
  const [config, setConfig] = useState({
    startDate: '',
    endDate: '',
    collaboratorIds: [] as string[],
    metrics: { demands: true, leads: true },
  })

  const handleGenerate = () => {
    exportDetailedPDF(rawData, config)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white text-black p-6 rounded-lg shadow-2xl w-full max-w-xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Relatório PDF</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold">Data Inicial</label>
              <input
                type="date"
                className="border w-full p-2 rounded"
                value={config.startDate}
                onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-bold">Data Final</label>
              <input
                type="date"
                className="border w-full p-2 rounded"
                value={config.endDate}
                onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold">Colaboradores</label>
            <div className="border rounded p-2 h-32 overflow-y-auto">
              {rawData.users.map((u: any) => (
                <label key={u.id} className="flex items-center gap-2 text-sm mb-1">
                  <input
                    type="checkbox"
                    checked={config.collaboratorIds.includes(u.id)}
                    onChange={(e) => {
                      const newIds = e.target.checked
                        ? [...config.collaboratorIds, u.id]
                        : config.collaboratorIds.filter((id) => id !== u.id)
                      setConfig({ ...config, collaboratorIds: newIds })
                    }}
                  />{' '}
                  {u.nome}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.metrics.demands}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    metrics: { ...config.metrics, demands: e.target.checked },
                  })
                }
              />{' '}
              Demandas
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.metrics.leads}
                onChange={(e) =>
                  setConfig({ ...config, metrics: { ...config.metrics, leads: e.target.checked } })
                }
              />{' '}
              Leads
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-black text-white rounded flex items-center hover:bg-gray-800"
          >
            <FileText className="w-4 h-4 mr-2" /> Gerar PDF
          </button>
        </div>
      </div>
    </div>
  )
}
