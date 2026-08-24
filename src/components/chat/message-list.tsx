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
  isLoading?: boolean
  loadError?: string | null
  accentColor?: string
  className?: string
}

const MessageList = ({
  conversation,
  messages,
  currentUserId,
  isOtherTyping = false,
  typingUserName,
  isLoading = false,
  loadError = null,
  accentColor,
  className,
}: MessageListProps) => {
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isNearBottomRef = React.useRef(true)
  const lastMessage = messages[messages.length - 1]

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    isNearBottomRef.current = distanceFromBottom < 120
  }

  // Auto-scroll to the latest message, but never yank the view down while
  // the user has scrolled up to read history — unless the new message is
  // their own send, which should always come into view.
  React.useEffect(() => {
    const isOwnMessage = lastMessage?.sender === currentUserId
    if (isNearBottomRef.current || isOwnMessage) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      isNearBottomRef.current = true
    }
  }, [messages.length, isOtherTyping, lastMessage?.sender, currentUserId])

  // Conversations always open scrolled to the bottom.
  React.useEffect(() => {
    isNearBottomRef.current = true
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [conversation._id])

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex flex-1 items-center justify-center bg-gray-50 dark:bg-[#111118]',
          className
        )}
      >
        <p className="text-sm text-secondary">Loading messages…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div
        className={cn(
          'flex flex-1 items-center justify-center bg-gray-50 px-6 text-center dark:bg-[#111118]',
          className
        )}
      >
        <p className="text-sm text-red-500">{loadError}</p>
      </div>
    )
  }

  if (messages.length === 0 && !isOtherTyping) {
    return <EmptyConversation conversation={conversation} className={className} />
  }

  const groups = groupMessagesByDay(messages)
  const resolvedTypingName =
    typingUserName ??
    (conversation.type === 'direct' ? conversation.participant.name : 'Someone')

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('flex-1 overflow-y-auto bg-gray-50 py-2 dark:bg-[#111118]', className)}
    >
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
                accentColor={accentColor}
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
