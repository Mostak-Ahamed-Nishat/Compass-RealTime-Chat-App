import * as React from 'react'
import { ArrowLeft, Info, Phone, Video } from 'lucide-react'
import { IconButton, PresenceIndicator } from '@/components/ui'
import { getConversationName } from '@/lib/conversation'
import { ConversationAvatar } from './conversation-avatar'
import type { Conversation } from '@/types'

export interface ChatHeaderProps {
  conversation: Conversation
  nickname?: string
  onToggleDetails?: () => void
  onBack?: () => void
}

const ChatHeader = ({
  conversation,
  nickname,
  onToggleDetails,
  onBack,
}: ChatHeaderProps) => {
  const name = nickname || getConversationName(conversation)
  const isOnline = conversation.type === 'direct' ? (conversation.participant.isOnline ?? true) : undefined
  const subtitle =
    conversation.type === 'group'
      ? `${conversation.participants.length} members`
      : isOnline ? 'Online'
      : `Last seen ${conversation.participant.lastSeen || 'recently'}`

  return (
    <header className="flex h-[73px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-white/10 dark:bg-[#0b0b12] md:px-6">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        {onBack && (
          <button
            type="button"
            aria-label="Back to chats"
            onClick={onBack}
            className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-gray-100 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <ConversationAvatar
          name={name}
          isOnline={isOnline ?? true}
          showPresence={conversation.type === 'direct'}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
          {subtitle && (
            <div className="flex items-center gap-1.5 truncate text-xs text-secondary">
              {conversation.type === 'direct' && isOnline !== undefined && (
                <PresenceIndicator isOnline={isOnline} className="h-2 w-2" />
              )}
              <span className="truncate">{subtitle}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <IconButton icon={<Phone className="h-5 w-5" />} label="Call" />
        <IconButton icon={<Video className="h-5 w-5" />} label="Video call" />
        <IconButton
          icon={<Info className="h-5 w-5" />}
          label="Conversation details"
          onClick={onToggleDetails}
        />
      </div>
    </header>
  )
}

export { ChatHeader }
