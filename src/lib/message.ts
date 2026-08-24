import type { Message } from '@/types'

export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function formatDateDividerLabel(iso: string): string {
  const date = new Date(iso)
  const now = new Date()

  if (date.toDateString() === now.toDateString()) return 'Today'

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString([], {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export interface MessageDayGroup {
  label: string
  messages: Message[]
}

export function groupMessagesByDay(messages: Message[]): MessageDayGroup[] {
  const groups: MessageDayGroup[] = []

  for (const message of messages) {
    const label = formatDateDividerLabel(message.createdAt)
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.label === label) {
      lastGroup.messages.push(message)
    } else {
      groups.push({ label, messages: [message] })
    }
  }

  return groups
}

// Images are sent as data URLs riding in the plain-text `text` field — the
// API has no media/upload endpoint, so this is the only way an image can
// travel over the real POST /messages + socket pipeline at all.
const IMAGE_DATA_URL_PATTERN = /^data:image\/[a-z0-9.+-]+;base64,/i

export function isImageMessage(text: string): boolean {
  return IMAGE_DATA_URL_PATTERN.test(text)
}

export const URL_PATTERN = /\bhttps?:\/\/[^\s<>"')]+/gi

export interface MessageLink {
  url: string
  messageId: string
  text: string
  createdAt: string
}

export function extractLinks(messages: Message[]): MessageLink[] {
  const links: MessageLink[] = []
  for (const message of messages) {
    if (isImageMessage(message.text)) continue
    const matches = message.text.match(URL_PATTERN)
    if (!matches) continue
    for (const url of matches) {
      links.push({
        url,
        messageId: message._id,
        text: message.text,
        createdAt: message.createdAt,
      })
    }
  }
  return links
}
