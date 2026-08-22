import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PresenceIndicatorProps {
  isOnline: boolean
  className?: string
}

const PresenceIndicator = ({ isOnline, className }: PresenceIndicatorProps) => {
  return (
    <div
      className={cn(
        'h-3 w-3 rounded-full border-2 border-white',
        isOnline ? 'bg-green-500' : 'bg-red-500',
        className
      )}
      aria-label={isOnline ? 'User is online' : 'User is offline'}
    />
  )
}

export { PresenceIndicator }
