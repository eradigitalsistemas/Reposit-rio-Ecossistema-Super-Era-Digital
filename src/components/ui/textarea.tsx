import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] md:min-h-[80px] w-full rounded-md border border-white/10 bg-[rgba(255,255,255,0.02)] px-3 py-2 text-base md:text-sm text-white ring-offset-background placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:border-white/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
