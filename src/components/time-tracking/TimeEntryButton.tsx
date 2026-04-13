import { Button } from '@/components/ui/button'
import { Loader2, LogIn, LogOut, Coffee, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimeEntryButtonProps {
  type: 'entrada' | 'intervalo_saida' | 'intervalo_entrada' | 'saida'
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TimeEntryButton({
  type,
  onClick,
  isLoading,
  disabled,
  size = 'md',
  className,
}: TimeEntryButtonProps) {
  const getIcon = () => {
    switch (type) {
      case 'entrada':
        return <LogIn className="w-5 h-5 mr-2" />
      case 'intervalo_saida':
        return <Coffee className="w-5 h-5 mr-2" />
      case 'intervalo_entrada':
        return <ArrowRight className="w-5 h-5 mr-2" />
      case 'saida':
        return <LogOut className="w-5 h-5 mr-2" />
    }
  }

  const getLabel = () => {
    switch (type) {
      case 'entrada':
        return 'Registrar Entrada'
      case 'intervalo_saida':
        return 'Saída para Intervalo'
      case 'intervalo_entrada':
        return 'Retorno do Intervalo'
      case 'saida':
        return 'Registrar Saída'
    }
  }

  const getColorClass = () => {
    switch (type) {
      case 'entrada':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white'
      case 'intervalo_saida':
        return 'bg-amber-500 hover:bg-amber-600 text-white'
      case 'intervalo_entrada':
        return 'bg-blue-500 hover:bg-blue-600 text-white'
      case 'saida':
        return 'bg-rose-600 hover:bg-rose-700 text-white'
    }
  }

  const sizeClasses = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-16 px-8 text-lg font-medium w-full',
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        getColorClass(),
        sizeClasses[size],
        'transition-all duration-200 shadow-sm hover:shadow-md',
        className,
      )}
    >
      {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : getIcon()}
      {getLabel()}
    </Button>
  )
}
