export interface User {
  _id: string
  name: string
  phone: string
  createdAt?: string
  // Client-only: presence status. In a real app, would come from Socket.io or presence API.
  isOnline?: boolean
  lastSeen?: string
}

export interface Message {
  _id: string
  conversation: string
  sender: string
  text: string
  createdAt: string
  // Client-only, set while an optimistic send is in flight or has failed.
  status?: 'sending' | 'failed'
  // Client-only: read receipt status. In a real app, would come from API.
  seen?: boolean
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
