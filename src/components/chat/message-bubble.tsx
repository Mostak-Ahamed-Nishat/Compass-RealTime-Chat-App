import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatMessageTime } from '@/lib/message'
import { ReadReceipt } from '@/components/ui'
import { ConversationAvatar } from './conversation-avatar'
import type { Message } from '@/types'

export interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  senderName?: string
  accentColor?: string
}

const MessageBubble = ({
  message,
  isOwn,
  senderName,
  accentColor,
}: MessageBubbleProps) => {
  const shouldReduceMotion = useReducedMotion()
  const isFailed = message.status === 'failed'
  const isSending = message.status === 'sending'

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn(
        'flex items-end gap-2 px-4 py-1',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!isOwn && <ConversationAvatar name={senderName ?? 'Unknown'} size="sm" />}

      <div
        className={cn(
          'flex max-w-[75%] flex-col gap-1',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        {!isOwn && senderName && (
          <span className="px-1 text-xs font-medium text-primary">
            {senderName}
          </span>
        )}
        <div
          style={isOwn && accentColor && !isFailed ? { backgroundColor: accentColor } : undefined}
          className={cn(
            'whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm leading-relaxed',
            isOwn
              ? 'rounded-br-md bg-primary text-primary-foreground'
              : 'rounded-bl-md border border-gray-200 bg-white text-gray-900',
            isSending && 'opacity-70',
            isFailed && 'bg-red-50 text-red-700 ring-1 ring-red-200'
          )}
        >
          {message.text}
        </div>
        <div className="flex items-center gap-1 px-1">
          <span
            className={cn(
              'text-[11px]',
              isFailed ? 'font-medium text-red-500' : 'text-secondary'
            )}
          >
            {isFailed
              ? 'Failed to send'
              : isSending
                ? 'Sending…'
                : formatMessageTime(message.createdAt)}
          </span>
          {isOwn && <ReadReceipt seen={message.seen} sending={isSending} />}
        </div>
      </div>
    </motion.div>
  )
}

export { MessageBubble }
