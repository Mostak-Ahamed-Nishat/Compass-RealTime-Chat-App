import * as React from 'react'
import { motion } from 'framer-motion'
import { BellOff, Pin } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatRelativeTime,
  getConversationName,
  getConversationSubtitle,
} from '@/lib/conversation'
import { ConversationAvatar } from './conversation-avatar'
import type { Conversation } from '@/types'

// Helper to get presence for conversation
const getConversationIsOnline = (conversation: Conversation): boolean | undefined => {
  if (conversation.type === 'direct') {
    return conversation.participant.isOnline
  }
  return undefined
}

export interface ConversationListItemProps {
  conversation: Conversation
  isActive?: boolean
  unreadCount?: number
  muted?: boolean
  pinned?: boolean
  nickname?: string
  isTyping?: boolean
  onClick?: () => void
}

const ConversationListItem = ({
  conversation,
  isActive = false,
  unreadCount = 0,
  muted = false,
  pinned = false,
  nickname,
  isTyping = false,
  onClick,
}: ConversationListItemProps) => {
  const name = nickname || getConversationName(conversation)
  const subtitle = getConversationSubtitle(conversation)
  const isOnline = getConversationIsOnline(conversation)
  const timestamp = formatRelativeTime(
    conversation.lastMessage &&
    'text' in conversation.lastMessage &&
    conversation.lastMessage.text
      ? conversation.lastMessage.createdAt
      : conversation.updatedAt
  )

  return (
    <motion.button
      layout
      transition={{ duration: 0.25, ease: 'easeOut' }}
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left transition-colors',
        isActive
          ? 'border-primary bg-primary/5'
          : cn(
              'border-transparent hover:bg-gray-50 dark:hover:bg-white/5',
              pinned && 'bg-gray-50/80 dark:bg-white/[0.03]'
            )
      )}
    >
      <ConversationAvatar
        name={name}
        isOnline={isOnline ?? true}
        showPresence={conversation.type === 'direct'}
        className="shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
            {pinned && (
              <Pin className="h-3 w-3 shrink-0 fill-current text-secondary" />
            )}
            <span className="truncate">{name}</span>
          </span>
          <span className="shrink-0 text-xs text-secondary">{timestamp}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              'truncate text-sm',
              isTyping ? 'font-medium italic text-primary' : 'text-secondary'
            )}
          >
            {isTyping ? 'typing…' : subtitle}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            {muted && <BellOff className="h-3.5 w-3.5 text-gray-400" />}
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  )
}

export { ConversationListItem }
