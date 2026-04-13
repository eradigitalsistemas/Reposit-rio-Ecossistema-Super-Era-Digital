import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useCandidateStore } from '@/stores/useCandidateStore'
import { useState, useEffect } from 'react'

export function CandidateFilters() {
  const { filters, setFilters } = useCandidateStore()
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(localFilters)
    }, 500)
    return () => clearTimeout(timer)
  }, [
    localFilters.profession,
    localFilters.min_salary,
    localFilters.max_salary,
    localFilters.start_date,
    localFilters.end_date,
  ])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={filters.status} onValueChange={(val) => setFilters({ status: val })}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Novo">Novo</SelectItem>
            <SelectItem value="Entrevistado">Entrevistado</SelectItem>
            <SelectItem value="Rejeitado">Rejeitado</SelectItem>
            <SelectItem value="Contratado">Contratado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Profissão</Label>
        <Input
          placeholder="Ex: Desenvolvedor"
          value={localFilters.profession}
          onChange={(e) => setLocalFilters({ ...localFilters, profession: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Pretensão Salarial</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={localFilters.min_salary}
            onChange={(e) => setLocalFilters({ ...localFilters, min_salary: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max"
            value={localFilters.max_salary}
            onChange={(e) => setLocalFilters({ ...localFilters, max_salary: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Data de Recebimento</Label>
        <div className="flex flex-col gap-2">
          <Input
            type="date"
            value={localFilters.start_date}
            onChange={(e) => setLocalFilters({ ...localFilters, start_date: e.target.value })}
          />
          <Input
            type="date"
            value={localFilters.end_date}
            onChange={(e) => setLocalFilters({ ...localFilters, end_date: e.target.value })}
          />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          const reset = {
            status: 'all',
            profession: '',
            min_salary: '',
            max_salary: '',
            start_date: '',
            end_date: '',
          }
          setLocalFilters({ ...localFilters, ...reset })
          setFilters(reset)
        }}
      >
        Limpar Filtros
      </Button>
    </div>
  )
}
