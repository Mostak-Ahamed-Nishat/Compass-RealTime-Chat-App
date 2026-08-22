import * as React from 'react'
import { ArrowLeft, Info, Phone, Video } from 'lucide-react'
import { IconButton } from '@/components/ui'
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
  const subtitle =
    conversation.type === 'group'
      ? `${conversation.participants.length} members`
      : null

  return (
    <header className="flex h-[73px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        {onBack && (
          <IconButton
            icon={<ArrowLeft className="h-5 w-5" />}
            label="Back to chats"
            onClick={onBack}
            className="md:hidden"
          />
        )}
        <ConversationAvatar name={name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
          {subtitle && (
            <p className="truncate text-xs text-secondary">{subtitle}</p>
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
