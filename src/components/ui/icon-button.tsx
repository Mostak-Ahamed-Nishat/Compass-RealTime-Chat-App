import * as React from 'react'
import { cn } from '@/lib/utils'

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label: string
  size?: 'sm' | 'default' | 'lg'
}

const sizeClasses: Record<NonNullable<IconButtonProps['size']>, string> = {
  sm: 'h-7 w-7',
  default: 'h-9 w-9',
  lg: 'h-10 w-10',
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, size = 'default', className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-gray-100 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  )
)
IconButton.displayName = 'IconButton'

export { IconButton }
