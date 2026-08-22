import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ReadReceiptProps {
  sending?: boolean
  className?: string
}

// The API has no read-receipt endpoint or socket event (confirmed by
// directly probing the live server — no "seen"/"read" event is ever
// relayed between two different accounts). So this can only ever show
// sent → delivered, never a real "seen by the other person" state —
// showing a green seen tick here would be fabricated, not real data.
const ReadReceipt = ({ sending = false, className }: ReadReceiptProps) => {
  if (sending) {
    return (
      <span className={cn('text-xs text-gray-400', className)}>
        ✓
      </span>
    )
  }

  return (
    <span className={cn('text-xs font-semibold text-gray-400', className)}>
      ✓✓
    </span>
  )
}

export { ReadReceipt }
