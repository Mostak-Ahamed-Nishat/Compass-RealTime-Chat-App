import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ReadReceiptProps {
  sending?: boolean
  seen?: boolean
  className?: string
}

// The API has no read-receipt endpoint or socket event (confirmed by
// directly probing the live server — no "seen"/"read" event is ever
// relayed between two different accounts), so this can never show a true
// "they read this message" state. `seen` is an approximation from real
// presence only: it's true when the recipient is known (via a later
// message:new from them — see lib/presence.ts) to have been active AFTER
// this message was sent. That proves they were using the app past that
// point, not that they specifically read this message — closer to
// "delivered and they were back online" than a genuine read receipt.
const ReadReceipt = ({ sending = false, seen = false, className }: ReadReceiptProps) => {
  if (sending) {
    return (
      <span className={cn('text-xs text-gray-400', className)}>
        ✓
      </span>
    )
  }

  return (
    <span
      className={cn(
        'text-xs font-semibold',
        seen ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400',
        className
      )}
    >
      ✓✓
    </span>
  )
}

export { ReadReceipt }
