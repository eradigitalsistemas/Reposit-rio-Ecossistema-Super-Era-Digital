import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-white text-black hover:bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.3)]',
        secondary:
          'border-transparent bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)]',
        destructive: 'border-transparent bg-white text-black hover:bg-white/80',
        outline: 'text-white border-white/20 hover:border-white/40 transition-all',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
