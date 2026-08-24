import * as React from 'react'
import { cn } from '@/lib/utils'
import { getConversationName } from '@/lib/conversation'
import { ConversationAvatar } from './conversation-avatar'
import type { Conversation } from '@/types'

export interface EmptyConversationProps {
  conversation: Conversation
  className?: string
}

const EmptyConversation = ({ conversation, className }: EmptyConversationProps) => {
  const name = getConversationName(conversation)

  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-2 bg-gray-50 px-6 text-center dark:bg-[#111118]',
        className
      )}
    >
      <ConversationAvatar name={name} size="lg" />
      <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{name}</p>
      <p className="text-sm text-secondary">No messages yet — say hi! 👋</p>
    </div>
  )
}

export { EmptyConversation }
