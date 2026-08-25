import type { Conversation } from '@/types'

// The live API has no presence endpoint or socket broadcast for other
// accounts (confirmed — only `message:new` and `conversation:updated`
// relay between accounts; see docs/API.md's Real-time section). The one
// genuine signal available is: receiving a `message:new` from someone
// proves their client sent it moments ago, so they were active then.
// That's the only thing this "online" status is allowed to claim.
export const ONLINE_WINDOW_MS = 2 * 60 * 1000

export type LastActiveMap = Record<string, number>

export interface Presence {
  // undefined = no signal at all yet — render nothing, never a fake default.
  isOnline: boolean | undefined
  lastActiveAt: number | undefined
}

export function getPresence(lastActiveAt: LastActiveMap, userId: string): Presence {
  const ts = lastActiveAt[userId]
  if (!ts) return { isOnline: undefined, lastActiveAt: undefined }
  return { isOnline: Date.now() - ts < ONLINE_WINDOW_MS, lastActiveAt: ts }
}

export function formatLastActive(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Applies real presence to a conversation's participant(s) without
// mutating the source — direct/group are enriched the same way, just
// against different fields per the API's differing shapes.
export function withPresence(
  conversation: Conversation,
  lastActiveAt: LastActiveMap
): Conversation {
  if (conversation.type === 'direct') {
    const presence = getPresence(lastActiveAt, conversation.participant._id)
    return {
      ...conversation,
      participant: {
        ...conversation.participant,
        isOnline: presence.isOnline,
        lastSeen:
          presence.lastActiveAt !== undefined
            ? formatLastActive(presence.lastActiveAt)
            : undefined,
        lastActiveAt: presence.lastActiveAt,
      },
    }
  }
  return {
    ...conversation,
    participants: conversation.participants.map((participant) => {
      const presence = getPresence(lastActiveAt, participant._id)
      return {
        ...participant,
        isOnline: presence.isOnline,
        lastSeen:
          presence.lastActiveAt !== undefined
            ? formatLastActive(presence.lastActiveAt)
            : undefined,
        lastActiveAt: presence.lastActiveAt,
      }
    }),
  }
}
