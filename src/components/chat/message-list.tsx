import * as React from 'react'
import { AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getSenderName } from '@/lib/conversation'
import { groupMessagesByDay } from '@/lib/message'
import { DateDivider } from './date-divider'
import { MessageBubble, messageDomId } from './message-bubble'
import { EmptyConversation } from './empty-conversation'
import { TypingIndicator } from './typing-indicator'
import type { Conversation, Message } from '@/types'

// `nonce` bumps on every request, even re-selecting the same message, so
// the scroll effect always retriggers (identical `id` alone wouldn't
// change and the effect would silently no-op on a repeat click).
export interface MessageJumpTarget {
  id: string
  nonce: number
}

export interface MessageListProps {
  conversation: Conversation
  messages: Message[]
  currentUserId: string
  isOtherTyping?: boolean
  typingUserName?: string
  isLoading?: boolean
  loadError?: string | null
  accentColor?: string
  jumpTarget?: MessageJumpTarget | null
  onJumpHandled?: () => void
  hasMoreMessages?: boolean
  isLoadingOlderMessages?: boolean
  onLoadOlderMessages?: () => void
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
  jumpTarget = null,
  onJumpHandled,
  hasMoreMessages = false,
  isLoadingOlderMessages = false,
  onLoadOlderMessages,
  className,
}: MessageListProps) => {
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isNearBottomRef = React.useRef(true)
  const lastMessage = messages[messages.length - 1]
  const [highlightedMessageId, setHighlightedMessageId] = React.useState<
    string | null
  >(null)
  // Guards against firing onLoadOlderMessages repeatedly while the parent's
  // isLoadingOlderMessages prop hasn't propagated back down yet (state
  // updates aren't synchronous, and momentum scroll can fire several
  // scroll events before that happens).
  const loadMoreTriggeredRef = React.useRef(false)
  React.useEffect(() => {
    if (!isLoadingOlderMessages) loadMoreTriggeredRef.current = false
  }, [isLoadingOlderMessages])
  // Captured right before requesting older history so the view can be
  // held in place once they're prepended, instead of the scroll position
  // jumping around as scrollHeight grows.
  const restoreScrollRef = React.useRef<{ height: number; top: number } | null>(
    null
  )

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    isNearBottomRef.current = distanceFromBottom < 120

    if (
      el.scrollTop < 60 &&
      hasMoreMessages &&
      !isLoadingOlderMessages &&
      !loadMoreTriggeredRef.current &&
      onLoadOlderMessages
    ) {
      loadMoreTriggeredRef.current = true
      restoreScrollRef.current = { height: el.scrollHeight, top: el.scrollTop }
      onLoadOlderMessages()
    }
  }

  React.useLayoutEffect(() => {
    const el = containerRef.current
    const restore = restoreScrollRef.current
    if (!el || !restore) return
    el.scrollTop = el.scrollHeight - restore.height + restore.top
    restoreScrollRef.current = null
  }, [messages])

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

  // Jump to a specific message — from a media grid item or a search
  // result — with a smooth scroll and a brief highlight so it's obvious
  // which message was landed on. Keyed on the DOM (getElementById) rather
  // than a ref map since the message list is unbounded and re-renders per
  // message; a ref map would need the same lookup wiring for no benefit.
  React.useEffect(() => {
    if (!jumpTarget) return
    const el = document.getElementById(messageDomId(jumpTarget.id))
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedMessageId(jumpTarget.id)
    }
    // Consume it immediately either way — a target this list doesn't have
    // (older than what's loaded) shouldn't linger and replay once older
    // history is fetched, and a handled one shouldn't replay on remount
    // (this component remounts per conversation, keyed by conversation id).
    onJumpHandled?.()
    const timer = setTimeout(() => setHighlightedMessageId(null), 1800)
    return () => clearTimeout(timer)
  }, [jumpTarget, onJumpHandled])

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
  // "Seen" is only approximated for direct chats — see ReadReceipt for why
  // (no real read event exists) and why group chats stay out of scope
  // (which of several participants "saw" it is genuinely ambiguous).
  const otherLastActiveAt =
    conversation.type === 'direct'
      ? conversation.participant.lastActiveAt
      : undefined

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('flex-1 overflow-y-auto bg-gray-50 py-2 dark:bg-[#111118]', className)}
    >
      {isLoadingOlderMessages && (
        <div className="flex items-center justify-center py-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary dark:border-white/15" />
        </div>
      )}
      {groups.map((group) => (
        <div key={group.label}>
          <DateDivider label={group.label} />
          {group.messages.map((message) => {
            const isOwn = message.sender === currentUserId
            const isSeen =
              isOwn &&
              otherLastActiveAt !== undefined &&
              otherLastActiveAt > new Date(message.createdAt).getTime()
            return (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={isOwn}
                senderName={
                  isOwn ? undefined : getSenderName(conversation, message.sender)
                }
                accentColor={accentColor}
                isHighlighted={highlightedMessageId === message._id}
                isSeen={isSeen}
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
