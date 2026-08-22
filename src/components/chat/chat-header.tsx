import * as React from 'react'
import { Info, Phone, Video } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import {
  getConversationAvatarUser,
  getConversationInitials,
  getConversationName,
} from '@/lib/conversation'
import type { Conversation } from '@/types'

export interface ChatHeaderProps {
  conversation: Conversation
  onToggleDetails?: () => void
}

const ChatHeader = ({ conversation, onToggleDetails }: ChatHeaderProps) => {
  const avatarUser = getConversationAvatarUser(conversation)
  const name = getConversationName(conversation)
  const subtitle =
    conversation.type === 'group'
      ? `${conversation.participants.length} members`
      : null

  return (
    <header className="flex h-[73px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="h-10 w-10">
          {avatarUser && <AvatarImage alt={name} />}
          <AvatarFallback>{getConversationInitials(conversation)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
          {subtitle && (
            <p className="truncate text-xs text-secondary">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Call"
          className="flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-gray-100"
        >
          <Phone className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Video call"
          className="flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-gray-100"
        >
          <Video className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Conversation details"
          onClick={onToggleDetails}
          className="flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-gray-100"
        >
          <Info className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}

export { ChatHeader }
