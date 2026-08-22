import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from './_app'
import { Sidebar, ChatHeader } from '@/components/chat'
import { auth as tokenStore } from '@/lib/auth'
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

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/')
    }
  }, [isLoading, currentUser, router])

  const handleLogout = () => {
    tokenStore.clearToken()
    router.push('/')
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
    <div className="flex h-screen bg-white">
      <Sidebar
        currentUser={currentUser}
        conversations={MOCK_CONVERSATIONS}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {selectedConversation ? (
          <>
            <ChatHeader conversation={selectedConversation} />
            <main className="flex flex-1 items-center justify-center bg-gray-50">
              <p className="text-sm text-secondary">
                Message list coming soon
              </p>
            </main>
          </>
        ) : (
          <main className="flex flex-1 items-center justify-center bg-gray-50">
            <p className="text-sm text-secondary">
              Select a conversation to start chatting
            </p>
          </main>
        )}
      </div>
    </div>
  )
}
