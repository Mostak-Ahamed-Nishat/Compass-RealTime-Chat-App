import * as React from 'react'
import { AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getSenderName } from '@/lib/conversation'
import { groupMessagesByDay } from '@/lib/message'
import { DateDivider } from './date-divider'
import { MessageBubble } from './message-bubble'
import { EmptyConversation } from './empty-conversation'
import { TypingIndicator } from './typing-indicator'
import type { Conversation, Message } from '@/types'

export interface MessageListProps {
  conversation: Conversation
  messages: Message[]
  currentUserId: string
  isOtherTyping?: boolean
  typingUserName?: string
  className?: string
}

const MessageList = ({
  conversation,
  messages,
  currentUserId,
  isOtherTyping = false,
  typingUserName,
  className,
}: MessageListProps) => {
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, isOtherTyping])

  if (messages.length === 0 && !isOtherTyping) {
    return <EmptyConversation conversation={conversation} className={className} />
  }

  const groups = groupMessagesByDay(messages)
  const resolvedTypingName =
    typingUserName ??
    (conversation.type === 'direct' ? conversation.participant.name : 'Someone')

  return (
    <div className={cn('flex-1 overflow-y-auto bg-gray-50 py-2', className)}>
      {groups.map((group) => (
        <div key={group.label}>
          <DateDivider label={group.label} />
          {group.messages.map((message) => {
            const isOwn = message.sender === currentUserId
            return (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={isOwn}
                senderName={
                  isOwn ? undefined : getSenderName(conversation, message.sender)
                }
              />
            )
          })}
        </div>
      ))}
      <AnimatePresence>
        {isOtherTyping && <TypingIndicator name={resolvedTypingName} />}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  )
}

export { MessageList }
