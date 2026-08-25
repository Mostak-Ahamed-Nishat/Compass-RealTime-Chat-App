export interface User {
  _id: string
  name: string
  phone: string
  createdAt?: string
  // Client-only presence, derived from real message:new activity only —
  // see lib/presence.ts for what these are and are not allowed to claim.
  isOnline?: boolean
  lastSeen?: string
  // Raw epoch-ms twin of lastSeen, used to compare against a specific
  // message's createdAt (e.g. for the "seen" read receipt approximation).
  lastActiveAt?: number
}

export interface Message {
  _id: string
  conversation: string
  sender: string
  text: string
  createdAt: string
  // Client-only, set while an optimistic send is in flight or has failed.
  status?: 'sending' | 'failed'
}

export interface ConversationDirect {
  _id: string
  type: 'direct'
  participant: User
  lastMessage: {
    text: string
    sender: string
    createdAt: string
  } | Record<string, never>
  updatedAt: string
}

export interface ConversationGroup {
  _id: string
  type: 'group'
  name: string
  createdBy: string
  admins: string[]
  participants: User[]
  lastMessage: {
    text: string
    sender: string
    createdAt: string
  } | Record<string, never>
  createdAt?: string
  updatedAt: string
}

export type Conversation = ConversationDirect | ConversationGroup

export interface MessageListResponse {
  messages: Message[]
  hasMore: boolean
}

export interface ConversationsResponse {
  data: Conversation[]
}
