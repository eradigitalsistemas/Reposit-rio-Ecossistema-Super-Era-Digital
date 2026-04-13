import { Button } from '@/components/ui/button'
import { Loader2, LogIn, LogOut, Coffee, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimeEntryButtonProps {
  type: 'entrada' | 'intervalo_saida' | 'intervalo_entrada' | 'saida'
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

export function TimeEntryButton({
  type,
  onClick,
  isLoading,
  disabled,
  className,
}: TimeEntryButtonProps) {
  const config = {
    entrada: {
      label: 'Registrar Entrada',
      icon: LogIn,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    intervalo_saida: {
      label: 'Saída para Intervalo',
      icon: Coffee,
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    intervalo_entrada: {
      label: 'Retorno do Intervalo',
      icon: ArrowRight,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    saida: {
      label: 'Registrar Saída',
      icon: LogOut,
      color: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
  }

  const { label, icon: Icon, color } = config[type]

  return (
    <Button
      size="lg"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'w-full h-16 text-base font-semibold transition-all shadow-md active:scale-[0.98] rounded-xl',
        color,
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <Icon className="w-5 h-5 mr-2" />
      )}
      {label}
    </Button>
  )
}
