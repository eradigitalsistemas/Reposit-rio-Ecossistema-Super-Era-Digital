import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { AddLeadModal } from './AddLeadModal'
import useLeadStore from '@/stores/useLeadStore'
import { useLocation } from 'react-router-dom'

export function Header() {
  const { searchQuery, setSearchQuery } = useLeadStore()
  const location = useLocation()

  const isDemandas = location.pathname === '/demandas'
  const pageTitle = isDemandas ? 'Gestão de Demandas' : 'Pipeline de Vendas'

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger className="-ml-2 md:hidden" />
      <div className="flex-1 flex items-center justify-between">
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-lg font-semibold">{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4 flex-1 justify-end">
          {!isDemandas && (
            <div className="relative w-full max-w-sm hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar leads..."
                className="w-full bg-muted/50 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          {!isDemandas && <AddLeadModal />}
          <div className="h-6 w-px bg-border hidden sm:block" />
          <Avatar className="h-9 w-9 border cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage
              src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3"
              alt="User"
            />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
