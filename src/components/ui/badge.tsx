import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gray-900 text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-white/80 shadow-sm dark:shadow-[0_0_8px_rgba(255,255,255,0.3)]',
        secondary:
          'border-transparent bg-gray-100 text-gray-900 dark:bg-[rgba(255,255,255,0.1)] dark:text-white hover:bg-gray-200 dark:hover:bg-[rgba(255,255,255,0.15)]',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border-border hover:border-foreground/40 transition-all',
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
