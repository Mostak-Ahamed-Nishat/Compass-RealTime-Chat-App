import type { Conversation, User } from '@/types'

export function getConversationName(conversation: Conversation): string {
  return conversation.type === 'direct'
    ? conversation.participant.name
    : conversation.name
}

export function getConversationAvatarUser(conversation: Conversation): User | null {
  return conversation.type === 'direct' ? conversation.participant : null
}

export function getSenderName(conversation: Conversation, senderId: string): string {
  if (conversation.type === 'direct') return conversation.participant.name
  return (
    conversation.participants.find((p) => p._id === senderId)?.name ?? 'Unknown'
  )
}

export function getConversationSubtitle(conversation: Conversation): string {
  const { lastMessage } = conversation
  if (!lastMessage || !('text' in lastMessage) || !lastMessage.text) {
    return 'No messages yet'
  }
  return lastMessage.text
}

export function formatRelativeTime(iso: string | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'now'
  if (diffMin < 60) return `${diffMin}m`

  const isSameDay = date.toDateString() === now.toDateString()
  if (isSameDay) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
