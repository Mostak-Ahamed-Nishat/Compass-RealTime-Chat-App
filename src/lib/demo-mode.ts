import type { Conversation, Message, User } from '@/types'

// Offline fallback for when the live API is unreachable — lets the UI be
// clicked through end-to-end against seeded local data instead of real
// network calls. Entirely client-side; nothing here ever touches the server.
const FLAG_KEY = 'compass_demo_mode'
const DEMO_TOKEN = 'demo-token'

export const DEMO_USER: User = {
  _id: 'demo-self',
  name: 'You (Demo)',
  phone: '15550001111',
  createdAt: new Date().toISOString(),
}

const CONTACTS: User[] = [
  { _id: 'demo-u1', name: 'Amara Chen', phone: '15550002222' },
  { _id: 'demo-u2', name: 'Diego Santos', phone: '15550003333' },
  { _id: 'demo-u3', name: 'Priya Nair', phone: '15550004444' },
]

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

let nextMessageId = 1
function makeMessage(conversation: string, sender: string, text: string, minsAgo: number): Message {
  return {
    _id: `demo-msg-${nextMessageId++}`,
    conversation,
    sender,
    text,
    createdAt: minutesAgo(minsAgo),
  }
}

let conversations: Conversation[] = [
  {
    _id: 'demo-c1',
    type: 'direct',
    participant: CONTACTS[0],
    lastMessage: { text: 'See you at 6?', sender: CONTACTS[0]._id, createdAt: minutesAgo(4) },
    updatedAt: minutesAgo(4),
  },
  {
    _id: 'demo-c2',
    type: 'direct',
    participant: CONTACTS[1],
    lastMessage: {},
    updatedAt: minutesAgo(180),
  },
  {
    _id: 'demo-c3',
    type: 'group',
    name: 'Weekend Trip',
    createdBy: DEMO_USER._id,
    admins: [DEMO_USER._id],
    participants: [DEMO_USER, CONTACTS[0], CONTACTS[2]],
    lastMessage: { text: 'Check this out: https://example.com/cabin', sender: CONTACTS[2]._id, createdAt: minutesAgo(20) },
    updatedAt: minutesAgo(20),
  },
]

let messagesByConversation: Record<string, Message[]> = {
  'demo-c1': [
    makeMessage('demo-c1', CONTACTS[0]._id, 'Hey! Are we still on for tonight?', 40),
    makeMessage('demo-c1', DEMO_USER._id, 'Yes! Just finishing up work.', 32),
    makeMessage('demo-c1', CONTACTS[0]._id, 'See you at 6?', 4),
  ],
  'demo-c2': [],
  'demo-c3': [
    makeMessage('demo-c3', CONTACTS[0]._id, 'Cabin is booked for the weekend 🎉', 60),
    makeMessage('demo-c3', DEMO_USER._id, "Can't wait, it's been forever.", 45),
    makeMessage('demo-c3', CONTACTS[2]._id, 'Check this out: https://example.com/cabin', 20),
  ],
}

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(FLAG_KEY) === '1'
}

export function enableDemoMode(): User {
  localStorage.setItem(FLAG_KEY, '1')
  localStorage.setItem('token', DEMO_TOKEN)
  return DEMO_USER
}

export function disableDemoMode(): void {
  localStorage.removeItem(FLAG_KEY)
}

export const demoApi = {
  conversations: {
    list: async () => ({ data: conversations }),

    startDirect: async (userId: string) => {
      const existing = conversations.find(
        (c) => c.type === 'direct' && c.participant._id === userId
      )
      if (existing) return { _id: existing._id }

      const contact = CONTACTS.find((c) => c._id === userId) ?? {
        _id: userId,
        name: 'New contact',
        phone: '',
      }
      const created: Conversation = {
        _id: `demo-c${conversations.length + 1}`,
        type: 'direct',
        participant: contact,
        lastMessage: {},
        updatedAt: minutesAgo(0),
      }
      conversations = [created, ...conversations]
      messagesByConversation[created._id] = []
      return { _id: created._id }
    },

    getMessages: async (conversationId: string) => ({
      messages: messagesByConversation[conversationId] ?? [],
      hasMore: false,
    }),

    createGroup: async (name: string, participantIds: string[]) => {
      const participants = [
        DEMO_USER,
        ...CONTACTS.filter((c) => participantIds.includes(c._id)),
      ]
      const created: Conversation = {
        _id: `demo-c${conversations.length + 1}`,
        type: 'group',
        name,
        createdBy: DEMO_USER._id,
        admins: [DEMO_USER._id],
        participants,
        lastMessage: {},
        createdAt: minutesAgo(0),
        updatedAt: minutesAgo(0),
      }
      conversations = [created, ...conversations]
      messagesByConversation[created._id] = []
      return created
    },
  },

  messages: {
    send: async (conversationId: string, text: string) => {
      const message = makeMessage(conversationId, DEMO_USER._id, text, 0)
      messagesByConversation[conversationId] = [
        ...(messagesByConversation[conversationId] ?? []),
        message,
      ]
      conversations = conversations.map((c) =>
        c._id === conversationId
          ? { ...c, lastMessage: { text, sender: DEMO_USER._id, createdAt: message.createdAt }, updatedAt: message.createdAt }
          : c
      )
      return message
    },
  },

  users: {
    search: async (q: string) => {
      const query = q.trim().toLowerCase()
      if (!query) return []
      return CONTACTS.filter((c) => c.name.toLowerCase().includes(query))
    },
  },
}
