import { useState, useEffect } from 'react'
import { Search, FileText, Users, UserSquare, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'

type SearchResult = {
  id: string
  type: 'lead' | 'demanda' | 'cliente'
  title: string
  subtitle?: string
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const [leadsRes, demandsRes, clientsRes] = await Promise.all([
          supabase
            .from('leads')
            .select('id, nome, email, empresa')
            .or(`nome.ilike.%${query}%,email.ilike.%${query}%,empresa.ilike.%${query}%`)
            .limit(5),
          supabase
            .from('demandas')
            .select('id, titulo, descricao')
            .or(`titulo.ilike.%${query}%,descricao.ilike.%${query}%`)
            .limit(5),
          supabase
            .from('clientes_externos')
            .select('id, nome, email, empresa')
            .or(`nome.ilike.%${query}%,email.ilike.%${query}%,empresa.ilike.%${query}%`)
            .limit(5),
        ])

        const newResults: SearchResult[] = []

        if (demandsRes.data) {
          demandsRes.data.forEach((d) => {
            newResults.push({
              id: d.id,
              type: 'demanda',
              title: d.titulo,
              subtitle: d.descricao || '',
            })
          })
        }

        if (leadsRes.data) {
          leadsRes.data.forEach((l) => {
            newResults.push({
              id: l.id,
              type: 'lead',
              title: l.nome,
              subtitle: l.empresa || l.email,
            })
          })
        }

        if (clientsRes.data) {
          clientsRes.data.forEach((c) => {
            newResults.push({
              id: c.id,
              type: 'cliente',
              title: c.nome,
              subtitle: c.empresa || c.email,
            })
          })
        }

        setResults(newResults)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (item: SearchResult) => {
    setOpen(false)
    if (item.type === 'demanda') {
      navigate(`/demandas?highlight=${item.id}`)
    } else if (item.type === 'lead') {
      navigate(`/vendas?highlight=${item.id}`)
    } else if (item.type === 'cliente') {
      navigate(`/clientes/${item.id}`)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 w-9 sm:w-40 lg:w-64 px-0 sm:px-3"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 m-auto sm:m-0 sm:mr-2" />
        <span className="hidden sm:inline-flex lg:hidden">Buscar...</span>
        <span className="hidden lg:inline-flex">Buscar no sistema...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Digite para buscar demandas, leads ou clientes..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : query ? (
              'Nenhum resultado encontrado.'
            ) : (
              'Comece a digitar para buscar.'
            )}
          </CommandEmpty>

          {results.length > 0 && (
            <CommandGroup heading="Resultados">
              {results.map((item) => (
                <CommandItem
                  key={`${item.type}-${item.id}`}
                  onSelect={() => handleSelect(item)}
                  value={`${item.title} ${item.subtitle || ''} ${query}`}
                  className="flex items-center p-2 cursor-pointer"
                >
                  {item.type === 'demanda' && (
                    <FileText className="mr-2 h-4 w-4 shrink-0 text-primary" />
                  )}
                  {item.type === 'lead' && (
                    <UserSquare className="mr-2 h-4 w-4 shrink-0 text-blue-500" />
                  )}
                  {item.type === 'cliente' && (
                    <Users className="mr-2 h-4 w-4 shrink-0 text-green-500" />
                  )}
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="truncate font-medium">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-xs text-muted-foreground truncate">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0">
                    {item.type}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
