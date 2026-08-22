import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import { AuthContext } from './_app'
import {
  Sidebar,
  ChatHeader,
  ChatDetailsPanel,
  Composer,
  MessageList,
  MobileTabBar,
  NewChatDialog,
  NewGroupDialog,
  AddMembersDialog,
} from '@/components/chat'
import { auth as tokenStore } from '@/lib/auth'
import {
  conversations as conversationsApi,
  messages as messagesApi,
} from '@/lib/api'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import { cn } from '@/lib/utils'
import type {
  Conversation,
  ConversationsResponse,
  Message,
  MessageListResponse,
  User,
} from '@/types'

export default function ChatPage() {
  const router = useRouter()
  const { currentUser, isLoading, setCurrentUser } = useContext(AuthContext)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [conversationsError, setConversationsError] = useState<string | null>(
    null
  )
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list')
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [startingUserId, setStartingUserId] = useState<string | null>(null)
  const [removingParticipantId, setRemovingParticipantId] = useState<
    string | null
  >(null)
  const [isLeavingGroup, setIsLeavingGroup] = useState(false)
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false)
  const [isAddingMembers, setIsAddingMembers] = useState(false)
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, Message[]>
  >({})
  const [messageLoadState, setMessageLoadState] = useState<
    Record<string, 'loading' | 'loaded' | 'error'>
  >({})
  const [messageLoadErrors, setMessageLoadErrors] = useState<
    Record<string, string>
  >({})
  const [typingConversationId, setTypingConversationId] = useState<
    string | null
  >(null)
  const [mutedConversationIds, setMutedConversationIds] = useState<Set<string>>(
    () => new Set()
  )
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [nicknames, setNicknames] = useState<Record<string, string>>({})
  const [accentColors, setAccentColors] = useState<Record<string, string>>({})
  const [quickEmojis, setQuickEmojis] = useState<Record<string, string>>({})
  const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  // handleNewMessage lives inside an effect keyed only on currentUser._id, so
  // it would otherwise close over a stale selectedConversationId — this ref
  // always has the current value.
  const selectedConversationIdRef = React.useRef<string | null>(null)
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId
  }, [selectedConversationId])
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/')
    }
  }, [isLoading, currentUser, router])

  useEffect(() => {
    if (!currentUser?._id) return
    let cancelled = false
    setConversationsLoading(true)
    conversationsApi
      .list()
      .then((res) => {
        if (cancelled) return
        setConversations((res as ConversationsResponse).data ?? [])
        setConversationsError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setConversationsError(
          err?.error?.message || 'Failed to load conversations'
        )
      })
      .finally(() => {
        if (!cancelled) setConversationsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [currentUser?._id])

  // Auto-select the first conversation once the list loads, if none is selected yet.
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0]._id)
    }
  }, [conversations, selectedConversationId])

  // Fetch each conversation's history the first time it's opened, and cache it.
  // Gated by a ref (not the `messageLoadState` it writes to) — depending on
  // that state here would re-run this effect the instant it calls
  // setMessageLoadState, and the resulting cleanup would cancel the very
  // fetch it just started before it ever resolved.
  const requestedMessageConversationsRef = React.useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!selectedConversationId) return
    const conversationId = selectedConversationId
    if (requestedMessageConversationsRef.current.has(conversationId)) return
    requestedMessageConversationsRef.current.add(conversationId)

    let cancelled = false
    setMessageLoadState((prev) => ({ ...prev, [conversationId]: 'loading' }))
    conversationsApi
      .getMessages(conversationId)
      .then((res) => {
        if (cancelled) return
        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: (res as MessageListResponse).messages ?? [],
        }))
        setMessageLoadState((prev) => ({ ...prev, [conversationId]: 'loaded' }))
      })
      .catch((err) => {
        if (cancelled) return
        requestedMessageConversationsRef.current.delete(conversationId)
        setMessageLoadErrors((prev) => ({
          ...prev,
          [conversationId]: err?.error?.message || 'Failed to load messages',
        }))
        setMessageLoadState((prev) => ({ ...prev, [conversationId]: 'error' }))
      })
    return () => {
      cancelled = true
    }
  }, [selectedConversationId])

  // Real-time: connect once per session and listen for events from OTHER
  // participants. `message:new` and `conversation:updated` are confirmed
  // working; `typing` is inferred by analogy (same relay pattern) and isn't
  // documented, so it's best-effort.
  useEffect(() => {
    if (!currentUser?._id) return
    const token = tokenStore.getToken()
    if (!token) return
    const socket = connectSocket(token)
    const userId = currentUser._id

    const handleNewMessage = (payload: {
      id: string
      conversation: string
      sender: string
      text: string
      createdAt: number
    }) => {
      if (!payload?.conversation || payload.sender === userId) return
      const message: Message = {
        _id: payload.id,
        conversation: payload.conversation,
        sender: payload.sender,
        text: payload.text,
        createdAt: new Date(payload.createdAt).toISOString(),
      }
      setMessagesByConversation((prev) => {
        const existing = prev[message.conversation] ?? []
        if (existing.some((m) => m._id === message._id)) return prev
        return { ...prev, [message.conversation]: [...existing, message] }
      })
      bumpConversationPreview(message.conversation, {
        text: message.text,
        sender: message.sender,
        createdAt: message.createdAt,
      })
      setTypingConversationId((current) =>
        current === message.conversation ? null : current
      )
      // Only badge conversations you aren't currently looking at.
      if (message.conversation !== selectedConversationIdRef.current) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.conversation]: (prev[message.conversation] ?? 0) + 1,
        }))
      }
    }

    const handleConversationUpdated = (payload: Conversation) => {
      if (!payload?._id) return
      setConversations((prev) =>
        prev.some((c) => c._id === payload._id)
          ? prev.map((c) => (c._id === payload._id ? payload : c))
          : [payload, ...prev]
      )
    }

    // Only ever fires for OTHER users typing — this client emits its own
    // typing state (see handleTyping) instead of setting it locally.
    const handleTypingEvent = (payload: {
      conversationId?: string
      userId?: string
    }) => {
      if (!payload?.conversationId || payload.userId === userId) return
      const conversationId = payload.conversationId
      setTypingConversationId(conversationId)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        setTypingConversationId((current) =>
          current === conversationId ? null : current
        )
      }, 3000)
    }

    socket.on('message:new', handleNewMessage)
    socket.on('conversation:updated', handleConversationUpdated)
    socket.on('typing', handleTypingEvent)

    return () => {
      socket.off('message:new', handleNewMessage)
      socket.off('conversation:updated', handleConversationUpdated)
      socket.off('typing', handleTypingEvent)
    }
  }, [currentUser?._id])

  const handleLogout = () => {
    disconnectSocket()
    tokenStore.clearToken()
    // AuthContext isn't remounted on client-side navigation, so the stale
    // currentUser must be cleared explicitly — otherwise index.tsx's
    // "already logged in" redirect immediately bounces back into /chat.
    setCurrentUser(null)
    router.push('/')
  }

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
    setMobileView('thread')
    setIsDetailsOpen(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    setTypingConversationId(null)
    setUnreadCounts((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleSelectUserForNewChat = async (user: User) => {
    if (!currentUser) return
    setStartingUserId(user._id)
    try {
      // POST /conversations returns a raw document (id-only `participants`,
      // no `type`) rather than the enriched shape the rest of the app
      // expects — re-fetch the list to get something renderable, per
      // docs/API.md's note on this endpoint.
      const created = (await conversationsApi.startDirect(user._id)) as {
        _id: string
      }
      const res = (await conversationsApi.list()) as ConversationsResponse
      setConversations(res.data ?? [])
      handleSelectConversation(created._id)
      setIsNewChatOpen(false)
    } catch (err: any) {
      setConversationsError(
        err?.error?.message || 'Failed to start conversation'
      )
    } finally {
      setStartingUserId(null)
    }
  }

  const handleCreateGroup = async (name: string, participantIds: string[]) => {
    setIsCreatingGroup(true)
    try {
      const created = (await conversationsApi.createGroup(
        name,
        participantIds
      )) as Conversation
      setConversations((prev) => [created, ...prev])
      handleSelectConversation(created._id)
      setIsNewGroupOpen(false)
    } catch (err: any) {
      setConversationsError(err?.error?.message || 'Failed to create group')
    } finally {
      setIsCreatingGroup(false)
    }
  }

  const handleRemoveParticipant = async (
    conversationId: string,
    userId: string
  ) => {
    setRemovingParticipantId(userId)
    try {
      const updated = (await conversationsApi.removeParticipant(
        conversationId,
        userId
      )) as Conversation
      setConversations((prev) =>
        prev.map((c) => (c._id === conversationId ? updated : c))
      )
    } catch (err: any) {
      setConversationsError(
        err?.error?.message || 'Failed to remove member'
      )
    } finally {
      setRemovingParticipantId(null)
    }
  }

  const handleLeaveGroup = async (conversationId: string) => {
    if (!currentUser?._id) return
    setIsLeavingGroup(true)
    try {
      await conversationsApi.removeParticipant(conversationId, currentUser._id)
      setConversations((prev) => prev.filter((c) => c._id !== conversationId))
      setIsDetailsOpen(false)
      setSelectedConversationId((current) =>
        current === conversationId ? null : current
      )
    } catch (err: any) {
      setConversationsError(err?.error?.message || 'Failed to leave group')
    } finally {
      setIsLeavingGroup(false)
    }
  }

  const handleAddParticipants = async (
    conversationId: string,
    userIds: string[]
  ) => {
    setIsAddingMembers(true)
    try {
      const updated = (await conversationsApi.addParticipants(
        conversationId,
        userIds
      )) as Conversation
      setConversations((prev) =>
        prev.map((c) => (c._id === conversationId ? updated : c))
      )
      setIsAddMembersOpen(false)
    } catch (err: any) {
      setConversationsError(err?.error?.message || 'Failed to add members')
    } finally {
      setIsAddingMembers(false)
    }
  }

  const handleRenameGroup = async (conversationId: string, name: string) => {
    try {
      const updated = (await conversationsApi.rename(
        conversationId,
        name
      )) as Conversation
      setConversations((prev) =>
        prev.map((c) => (c._id === conversationId ? updated : c))
      )
    } catch (err: any) {
      setConversationsError(err?.error?.message || 'Failed to rename group')
    }
  }

  // This side only EMITS typing — it never sets local state from its own
  // keystrokes. The indicator only ever renders from a `typing` event this
  // client RECEIVES from someone else's socket (see the listener above).
  const handleTyping = () => {
    if (!selectedConversationId) return
    getSocket()?.emit('typing', { conversationId: selectedConversationId })
  }

  const handleToggleMute = (conversationId: string) => {
    setMutedConversationIds((prev) => {
      const next = new Set(prev)
      if (next.has(conversationId)) next.delete(conversationId)
      else next.add(conversationId)
      return next
    })
  }

  const handleSetNickname = (conversationId: string, nickname?: string) => {
    setNicknames((prev) => {
      const next = { ...prev }
      if (nickname) next[conversationId] = nickname
      else delete next[conversationId]
      return next
    })
  }

  const handleSetAccentColor = (conversationId: string, color?: string) => {
    setAccentColors((prev) => {
      const next = { ...prev }
      if (color) next[conversationId] = color
      else delete next[conversationId]
      return next
    })
  }

  const handleSetQuickEmoji = (conversationId: string, emoji?: string) => {
    setQuickEmojis((prev) => {
      const next = { ...prev }
      if (emoji) next[conversationId] = emoji
      else delete next[conversationId]
      return next
    })
  }

  // Moves a conversation to the top of the list with an updated preview —
  // mirrors WhatsApp-style "most recently active chat floats up" behavior.
  // The reorder itself animates via ConversationListItem's `layout` prop.
  const bumpConversationPreview = (
    conversationId: string,
    lastMessage: { text: string; sender: string; createdAt: string }
  ) => {
    setConversations((prev) => {
      const index = prev.findIndex((c) => c._id === conversationId)
      if (index === -1) return prev
      const updated = { ...prev[index], lastMessage, updatedAt: lastMessage.createdAt }
      const next = prev.slice()
      next.splice(index, 1)
      next.unshift(updated)
      return next
    })
  }

  const setMessageInConversation = (
    conversationId: string,
    tempId: string,
    updater: (message: Message) => Message
  ) => {
    setMessagesByConversation((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] ?? []).map((m) =>
        m._id === tempId ? updater(m) : m
      ),
    }))
  }

  const handleSendMessage = async (text: string) => {
    if (!selectedConversationId || !currentUser?._id) return
    const conversationId = selectedConversationId
    const tempId = `local-${Date.now()}`

    const optimisticMessage: Message = {
      _id: tempId,
      conversation: conversationId,
      sender: currentUser._id,
      text,
      createdAt: new Date().toISOString(),
      status: 'sending',
    }

    setMessagesByConversation((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] ?? []), optimisticMessage],
    }))

    try {
      const response = (await messagesApi.send(conversationId, text)) as
        | Message
        | null

      // POST /messages returns 200 with body `null` for a nonexistent
      // conversationId instead of a 404 — treat that as a failed send.
      if (!response) {
        throw new Error('Conversation not found')
      }

      setMessageInConversation(conversationId, tempId, () => ({
        ...response,
        status: undefined,
      }))
      bumpConversationPreview(conversationId, {
        text: response.text,
        sender: response.sender,
        createdAt: response.createdAt,
      })
    } catch {
      setMessageInConversation(conversationId, tempId, (m) => ({
        ...m,
        status: 'failed',
      }))
    }
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

  const selectedConversation = conversations.find(
    (c) => c._id === selectedConversationId
  )
  const selectedMessageState = selectedConversationId
    ? messageLoadState[selectedConversationId]
    : undefined

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
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onLogout={handleLogout}
            onNewChat={() => setIsNewChatOpen(true)}
            onNewGroup={() => setIsNewGroupOpen(true)}
            onStartUserChat={handleSelectUserForNewChat}
            startingUserId={startingUserId}
            isLoading={conversationsLoading}
            loadError={conversationsError}
            mutedConversationIds={mutedConversationIds}
            unreadCounts={unreadCounts}
            nicknames={nicknames}
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
                  nickname={nicknames[selectedConversation._id]}
                  onBack={() => setMobileView('list')}
                  onToggleDetails={() => setIsDetailsOpen((open) => !open)}
                />
                <MessageList
                  conversation={selectedConversation}
                  messages={messagesByConversation[selectedConversation._id] ?? []}
                  currentUserId={currentUser._id}
                  isOtherTyping={typingConversationId === selectedConversation._id}
                  isLoading={selectedMessageState === 'loading'}
                  loadError={messageLoadErrors[selectedConversation._id] ?? null}
                  accentColor={accentColors[selectedConversation._id]}
                />
                <Composer
                  onSend={handleSendMessage}
                  onTyping={handleTyping}
                  quickEmoji={quickEmojis[selectedConversation._id]}
                />
              </motion.div>
            ) : (
              <motion.main
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex flex-1 flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center"
              >
                {conversationsLoading ? (
                  <p className="text-sm text-secondary">
                    Loading conversations…
                  </p>
                ) : (
                  <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MessageSquare className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        {conversations.length === 0
                          ? 'No conversations yet'
                          : 'Select a chat'}
                      </p>
                      <p className="mt-1 text-sm text-secondary">
                        {conversations.length === 0
                          ? 'Start a new chat to say hello 👋'
                          : 'Pick a conversation from the list to start messaging'}
                      </p>
                    </div>
                  </>
                )}
              </motion.main>
            )}
          </AnimatePresence>
        </div>
      </div>

      {selectedConversation && (
        <ChatDetailsPanel
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          conversation={selectedConversation}
          messages={messagesByConversation[selectedConversation._id] ?? []}
          currentUserId={currentUser._id}
          muted={mutedConversationIds.has(selectedConversation._id)}
          onToggleMute={() => handleToggleMute(selectedConversation._id)}
          nickname={nicknames[selectedConversation._id]}
          onSetNickname={(name) =>
            handleSetNickname(selectedConversation._id, name)
          }
          accentColor={accentColors[selectedConversation._id]}
          onSetAccentColor={(color) =>
            handleSetAccentColor(selectedConversation._id, color)
          }
          quickEmoji={quickEmojis[selectedConversation._id]}
          onSetQuickEmoji={(emoji) =>
            handleSetQuickEmoji(selectedConversation._id, emoji)
          }
          onRemoveParticipant={(userId) =>
            handleRemoveParticipant(selectedConversation._id, userId)
          }
          removingParticipantId={removingParticipantId}
          onLeaveGroup={() => handleLeaveGroup(selectedConversation._id)}
          isLeavingGroup={isLeavingGroup}
          onRenameGroup={(name) =>
            handleRenameGroup(selectedConversation._id, name)
          }
          onOpenAddMembers={() => setIsAddMembersOpen(true)}
        />
      )}

      <NewChatDialog
        open={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
        onSelectUser={handleSelectUserForNewChat}
        startingUserId={startingUserId}
      />

      <NewGroupDialog
        open={isNewGroupOpen}
        onOpenChange={setIsNewGroupOpen}
        currentUser={currentUser}
        conversations={conversations}
        onCreateGroup={handleCreateGroup}
        isCreating={isCreatingGroup}
      />

      {selectedConversation?.type === 'group' && (
        <AddMembersDialog
          open={isAddMembersOpen}
          onOpenChange={setIsAddMembersOpen}
          conversation={selectedConversation}
          onAddMembers={(userIds) =>
            handleAddParticipants(selectedConversation._id, userIds)
          }
          isAdding={isAddingMembers}
        />
      )}
    </div>
  )
}
