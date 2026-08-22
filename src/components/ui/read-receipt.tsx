import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ReadReceiptProps {
  seen?: boolean
  sending?: boolean
  className?: string
}

const ReadReceipt = ({ seen = false, sending = false, className }: ReadReceiptProps) => {
  if (sending) {
    return (
      <span className={cn('text-xs text-gray-400', className)}>
        ✓
      </span>
    )
  }

  return (
    <span className={cn(
      'text-xs font-semibold',
      seen ? 'text-green-500' : 'text-gray-400',
      className
    )}>
      ✓✓
    </span>
  )
}

export { ReadReceipt }
