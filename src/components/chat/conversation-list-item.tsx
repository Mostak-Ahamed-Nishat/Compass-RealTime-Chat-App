import * as React from 'react'
import { BellOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatRelativeTime,
  getConversationName,
  getConversationSubtitle,
} from '@/lib/conversation'
import { ConversationAvatar } from './conversation-avatar'
import type { Conversation } from '@/types'

export interface ConversationListItemProps {
  conversation: Conversation
  isActive?: boolean
  unreadCount?: number
  muted?: boolean
  nickname?: string
  onClick?: () => void
}

const ConversationListItem = ({
  conversation,
  isActive = false,
  unreadCount = 0,
  muted = false,
  nickname,
  onClick,
}: ConversationListItemProps) => {
  const name = nickname || getConversationName(conversation)
  const subtitle = getConversationSubtitle(conversation)
  const timestamp = formatRelativeTime(
    conversation.lastMessage &&
    'text' in conversation.lastMessage &&
    conversation.lastMessage.text
      ? conversation.lastMessage.createdAt
      : conversation.updatedAt
  )

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left transition-colors',
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-transparent hover:bg-gray-50'
      )}
    >
      <ConversationAvatar name={name} className="shrink-0" />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-gray-900">
            {name}
          </span>
          <span className="shrink-0 text-xs text-secondary">{timestamp}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-sm text-secondary">{subtitle}</span>
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
    </button>
  )
}

export { ConversationListItem }
