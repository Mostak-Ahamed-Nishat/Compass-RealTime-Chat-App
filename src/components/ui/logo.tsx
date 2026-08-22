import * as React from 'react'
import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LogoProps {
  variant?: 'light' | 'dark'
  className?: string
}

const Logo = ({ variant = 'dark', className }: LogoProps) => {
  const isLight = variant === 'light'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl',
          isLight ? 'bg-white/20 backdrop-blur-sm' : 'bg-primary'
        )}
      >
        <MessageSquare className="h-5 w-5 text-white" />
      </div>
      <span
        className={cn(
          'text-lg font-bold',
          isLight ? 'text-white' : 'text-gray-900'
        )}
      >
        Connectly
      </span>
    </div>
  )
}

export { Logo }
