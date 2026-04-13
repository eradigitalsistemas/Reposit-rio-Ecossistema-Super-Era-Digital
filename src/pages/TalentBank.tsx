import { useEffect, useState } from 'react'
import { useCandidateStore } from '@/stores/useCandidateStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, Briefcase, Users } from 'lucide-react'
import { CandidateFilters } from '@/components/talent/CandidateFilters'
import { CandidateList } from '@/components/talent/CandidateList'
import { CandidateDetails } from '@/components/talent/CandidateDetails'
import { ConvertCandidateDialog } from '@/components/talent/ConvertCandidateDialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'

export default function TalentBank() {
  const { fetchCandidates, filters, setFilters, page, limit, total, setPage } = useCandidateStore()
  const [localSearch, setLocalSearch] = useState(filters.search)

  useEffect(() => {
    fetchCandidates()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch.length >= 3 || localSearch.length === 0) {
        setFilters({ search: localSearch })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localSearch])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex h-full w-full flex-col lg:flex-row bg-background animate-fade-in-up">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:flex w-72 flex-col border-r bg-card/40 p-6 shrink-0 h-[calc(100vh-4rem)] sticky top-0 overflow-y-auto">
        <div className="flex items-center gap-2 mb-8 text-foreground">
          <div className="p-2 bg-primary/10 rounded-md">
            <Filter className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-semibold text-lg">Filtros</h2>
        </div>
        <CandidateFilters />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <div className="p-6 border-b bg-card/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <Users className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Banco de Talentos
              </h1>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-sm sm:text-base text-muted-foreground">
                Gerencie currículos, triagem e conversões.
              </p>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {total} encontrados
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou profissão..."
                className="pl-9 bg-background focus-visible:ring-primary/50"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-6 overflow-y-auto">
                <div className="flex items-center gap-2 mb-8 mt-2">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Filter className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-semibold text-lg">Filtros</h2>
                </div>
                <CandidateFilters />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* List Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-muted/10">
          <CandidateList />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center pb-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => page > 1 && setPage(page - 1)}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setPage(i + 1)}
                        isActive={page === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => page < totalPages && setPage(page + 1)}
                      className={
                        page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      <CandidateDetails />
      <ConvertCandidateDialog />
    </div>
  )
}
