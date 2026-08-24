import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatMessageTime, isImageMessage } from '@/lib/message'
import { ReadReceipt } from '@/components/ui'
import { ConversationAvatar } from './conversation-avatar'
import { ImageLightbox } from './image-lightbox'
import { LinkifiedText } from './linkified-text'
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
  const isImage = isImageMessage(message.text)
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false)

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
          'flex min-w-0 max-w-[75%] flex-col gap-1',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        {!isOwn && senderName && (
          <span className="px-1 text-xs font-medium text-primary">
            {senderName}
          </span>
        )}
        <div
          style={
            isOwn && accentColor && !isFailed && !isImage
              ? { backgroundColor: accentColor }
              : undefined
          }
          className={cn(
            'overflow-hidden rounded-2xl text-sm leading-relaxed',
            isImage ? 'p-1' : 'whitespace-pre-wrap break-words px-4 py-2',
            isOwn
              ? cn('rounded-br-md', !isImage && 'bg-primary text-primary-foreground')
              : cn(
                  'rounded-bl-md border border-gray-200 dark:border-white/10',
                  !isImage && 'bg-white text-gray-900 dark:bg-[#15151d] dark:text-white'
                ),
            isSending && 'opacity-70',
            isFailed && !isImage && 'bg-red-50 text-red-700 ring-1 ring-red-200'
          )}
        >
          {isImage ? (
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="block cursor-pointer transition-opacity hover:opacity-90"
            >
              <img
                src={message.text}
                alt="Shared image"
                className="max-h-72 w-full rounded-xl object-cover"
              />
            </button>
          ) : (
            <LinkifiedText
              text={message.text}
              linkClassName={cn(
                'underline underline-offset-2 hover:opacity-80',
                isOwn ? 'text-primary-foreground' : 'text-primary'
              )}
            />
          )}
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
          {isOwn && !isFailed && <ReadReceipt sending={isSending} />}
        </div>
      </div>

      {isImage && (
        <ImageLightbox
          src={isLightboxOpen ? message.text : null}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </motion.div>
  )
}

export { MessageBubble }
