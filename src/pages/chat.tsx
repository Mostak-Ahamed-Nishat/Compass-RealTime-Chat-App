import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AuthContext } from './_app'
import {
  Sidebar,
  ChatHeader,
  ChatDetailsPanel,
  Composer,
  MessageList,
  MobileTabBar,
} from '@/components/chat'
import { auth as tokenStore } from '@/lib/auth'
import { cn } from '@/lib/utils'
import type { Conversation, Message } from '@/types'

// Placeholder data for the sidebar/header layout until GET /conversations is wired up.
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    _id: 'c1',
    type: 'direct',
    participant: { _id: 'u1', name: 'Priya Sharma', phone: '+1 415 555 0101' },
    lastMessage: {
      text: 'Just landed in Bali!',
      sender: 'u1',
      createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    },
    updatedAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    _id: 'c2',
    type: 'direct',
    participant: { _id: 'u2', name: 'James Carter', phone: '+1 415 555 0102' },
    lastMessage: {},
    updatedAt: new Date(Date.now() - 11 * 3600000).toISOString(),
  },
  {
    _id: 'c3',
    type: 'group',
    name: 'Friendly Group',
    createdBy: 'u1',
    admins: ['u1'],
    participants: [
      { _id: 'u1', name: 'Priya Sharma', phone: '+1 415 555 0101' },
      { _id: 'u2', name: 'James Carter', phone: '+1 415 555 0102' },
      { _id: 'u3', name: 'Sofia Reyes', phone: '+1 415 555 0103' },
    ],
    lastMessage: {},
    updatedAt: new Date(Date.now() - 50 * 60000).toISOString(),
  },
]

export default function ChatPage() {
  const router = useRouter()
  const { currentUser, isLoading } = useContext(AuthContext)
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(MOCK_CONVERSATIONS[0]?._id ?? null)
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list')
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, Message[]>
  >({})
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/')
    }
  }, [isLoading, currentUser, router])

  // Seed a bit of placeholder history so the bubble/empty-state design is visible.
  // Replace with real GET /conversations/{id}/messages once that's wired up.
  useEffect(() => {
    if (!currentUser?._id) return
    setMessagesByConversation((prev) => {
      if (Object.keys(prev).length > 0) return prev
      const now = Date.now()
      return {
        c1: [
          {
            _id: 'm1',
            conversation: 'c1',
            sender: 'u1',
            text: 'Hey! How have you been?',
            createdAt: new Date(now - 3600_000).toISOString(),
          },
          {
            _id: 'm2',
            conversation: 'c1',
            sender: currentUser._id,
            text: 'Good! Just been super busy with work.',
            createdAt: new Date(now - 3500_000).toISOString(),
          },
          {
            _id: 'm3',
            conversation: 'c1',
            sender: 'u1',
            text: 'It was a great vacation, I was in Paris',
            createdAt: new Date(now - 1200_000).toISOString(),
          },
          {
            _id: 'm4',
            conversation: 'c1',
            sender: currentUser._id,
            text: 'Wow!! I hope you brought us gifts',
            createdAt: new Date(now - 900_000).toISOString(),
          },
          {
            _id: 'm5',
            conversation: 'c1',
            sender: 'u1',
            text: 'Just landed in Bali!',
            createdAt: new Date(now - 8 * 60000).toISOString(),
          },
        ],
        c2: [],
        c3: [
          {
            _id: 'm6',
            conversation: 'c3',
            sender: 'u2',
            text: 'Anyone free this weekend?',
            createdAt: new Date(now - 55 * 60000).toISOString(),
          },
          {
            _id: 'm7',
            conversation: 'c3',
            sender: 'u3',
            text: 'I might be! Let me check.',
            createdAt: new Date(now - 50 * 60000).toISOString(),
          },
        ],
      }
    })
  }, [currentUser?._id])

  const handleLogout = () => {
    tokenStore.clearToken()
    router.push('/')
  }

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
    setMobileView('thread')
    setIsDetailsOpen(false)
  }

  // TODO: wire to POST /messages once real conversation data is loaded.
  const handleSendMessage = (text: string) => {
    if (!selectedConversationId || !currentUser?._id) return
    const newMessage: Message = {
      _id: `local-${Date.now()}`,
      conversation: selectedConversationId,
      sender: currentUser._id,
      text,
      createdAt: new Date().toISOString(),
    }
    setMessagesByConversation((prev) => ({
      ...prev,
      [selectedConversationId]: [
        ...(prev[selectedConversationId] ?? []),
        newMessage,
      ],
    }))
  }

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  const selectedConversation = MOCK_CONVERSATIONS.find(
    (c) => c._id === selectedConversationId
  )

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="relative h-full w-full overflow-hidden md:contents">
        <div
          className={cn(
            'absolute inset-0 flex h-full w-full flex-col bg-white transition-transform duration-300 ease-in-out md:static md:inset-auto md:h-full md:w-auto md:shrink-0 md:translate-x-0 md:transition-none',
            mobileView === 'list' ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar
            currentUser={currentUser}
            conversations={MOCK_CONVERSATIONS}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onLogout={handleLogout}
          />
          <MobileTabBar
            active="chats"
            onChange={() => {}}
            className="md:hidden"
          />
        </div>

        <div
          className={cn(
            'absolute inset-0 flex h-full w-full min-w-0 flex-col bg-white transition-transform duration-300 ease-in-out md:static md:inset-auto md:h-full md:flex-1 md:translate-x-0 md:transition-none',
            mobileView === 'thread' ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {selectedConversation ? (
              <motion.div
                key={selectedConversation._id}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex h-full flex-1 flex-col"
              >
                <ChatHeader
                  conversation={selectedConversation}
                  onBack={() => setMobileView('list')}
                  onToggleDetails={() => setIsDetailsOpen((open) => !open)}
                />
                <MessageList
                  conversation={selectedConversation}
                  messages={messagesByConversation[selectedConversation._id] ?? []}
                  currentUserId={currentUser._id}
                />
                <Composer onSend={handleSendMessage} />
              </motion.div>
            ) : (
              <motion.main
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex flex-1 items-center justify-center bg-gray-50"
              >
                <p className="text-sm text-secondary">
                  Select a conversation to start chatting
                </p>
              </motion.main>
            )}
          </AnimatePresence>
        </div>
      </div>

      {selectedConversation && (
        <ChatDetailsPanel
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </div>
  )
}
