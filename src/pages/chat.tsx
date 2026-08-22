import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AuthContext } from './_app'
import {
  Sidebar,
  ChatHeader,
  ChatDetailsPanel,
  Composer,
  MobileTabBar,
} from '@/components/chat'
import { auth as tokenStore } from '@/lib/auth'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/types'

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
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/')
    }
  }, [isLoading, currentUser, router])

  const handleLogout = () => {
    tokenStore.clearToken()
    router.push('/')
  }

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
    setMobileView('thread')
    setIsDetailsOpen(false)
  }

  // TODO: wire to POST /messages once the message list is built.
  const handleSendMessage = (text: string) => {
    console.log('send message', text)
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
                <main className="flex flex-1 items-center justify-center bg-gray-50">
                  <p className="text-sm text-secondary">
                    Message list coming soon
                  </p>
                </main>
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
