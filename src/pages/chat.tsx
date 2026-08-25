import React, { useContext, useEffect, useState } from 'react'
import Head from 'next/head'
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
import { playMessageChime } from '@/lib/notification-sound'
import { mergeMessagesById, sortMessagesChronologically } from '@/lib/message'
import {
  conversationsCacheKey,
  loadCache,
  messagesCacheKey,
  saveCache,
} from '@/lib/cache'
import { withPresence } from '@/lib/presence'
import { useTheme } from '@/lib/theme'
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
  // Undefined = not known yet (assume there may be more until the first
  // fetch says otherwise, so "load older" isn't blocked before we've asked).
  const [hasMoreMessages, setHasMoreMessages] = useState<
    Record<string, boolean>
  >({})
  const [loadingOlderMessages, setLoadingOlderMessages] = useState<
    Record<string, boolean>
  >({})
  const [typingConversationId, setTypingConversationId] = useState<
    string | null
  >(null)
  const [jumpTarget, setJumpTarget] = useState<{
    id: string
    nonce: number
  } | null>(null)
  const jumpNonceRef = React.useRef(0)
  const [mutedConversationIds, setMutedConversationIds] = useState<Set<string>>(
    () => new Set()
  )
  const [pinnedConversationIds, setPinnedConversationIds] = useState<
    Set<string>
  >(() => new Set())
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
  // On mobile a conversation can stay "selected" (highlighted, its pane
  // still mounted) while the user is actually sitting on the list pane —
  // selection alone doesn't mean it's on screen there, only mobileView
  // does. Both are tracked in refs for the same stale-closure reason as
  // selectedConversationIdRef, and read together below to decide whether
  // an incoming message is actually being looked at right now.
  const mobileViewRef = React.useRef<'list' | 'thread'>('list')
  useEffect(() => {
    mobileViewRef.current = mobileView
  }, [mobileView])
  // Desktop always shows both panes at once, so a selected conversation is
  // always on screen there regardless of mobileView (which only matters
  // for the mobile stack-nav). Mirrors the md: breakpoint used in the JSX
  // below via matchMedia rather than a second, easy-to-drift source of
  // truth for "what counts as desktop".
  const isDesktopRef = React.useRef(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia('(min-width: 768px)')
    const update = () => {
      isDesktopRef.current = mql.matches
    }
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])
  // The socket effect below only re-runs on currentUser/fetchConversations
  // changes, so it would otherwise close over a stale mutedConversationIds
  // from whenever it was set up — same pattern as selectedConversationIdRef.
  const mutedConversationIdsRef = React.useRef<Set<string>>(new Set())
  useEffect(() => {
    mutedConversationIdsRef.current = mutedConversationIds
  }, [mutedConversationIds])
  // Cache bookkeeping for revalidation — when the list was last fetched
  // (for focus-based revalidation) and whether the socket has ever
  // connected before (so we only treat a later 'connect' as a *reconnect*
  // that needs resyncing, not the normal first connection on page load).
  const conversationsLastFetchedAtRef = React.useRef(0)
  const socketHasConnectedOnceRef = React.useRef(false)
  const pollingRef = React.useRef<{
    list?: ReturnType<typeof setInterval>
    messages?: ReturnType<typeof setInterval>
  }>({})
  const reduceMotion = useReducedMotion()
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login')
    }
  }, [isLoading, currentUser, router])

  // Shared by the initial load, focus revalidation, socket-reconnect
  // resync, and the polling fallback — one path, several triggers.
  const fetchConversations = React.useCallback(
    async ({ showLoadingState = false } = {}) => {
      if (showLoadingState) setConversationsLoading(true)
      try {
        const res = (await conversationsApi.list()) as ConversationsResponse
        const data = res.data ?? []
        setConversations(data)
        setConversationsError(null)
        conversationsLastFetchedAtRef.current = Date.now()
        if (currentUser?._id) {
          saveCache(conversationsCacheKey(currentUser._id), data)
        }
      } catch (err: any) {
        setConversationsError(
          err?.error?.message || 'Failed to load conversations'
        )
      } finally {
        if (showLoadingState) setConversationsLoading(false)
      }
    },
    [currentUser?._id]
  )

  // Hydrate instantly from the last-known snapshot (if any) so a reload
  // shows the previous state immediately instead of a blank loading
  // screen, then always still fetch fresh in the background — the cache
  // is a first paint, never a substitute for the real revalidation.
  useEffect(() => {
    if (!currentUser?._id) return
    const cached = loadCache<Conversation[]>(
      conversationsCacheKey(currentUser._id)
    )
    const hasCache = !!cached && cached.length > 0
    if (hasCache) {
      setConversations(cached as Conversation[])
      setConversationsLoading(false)
    }
    fetchConversations({ showLoadingState: !hasCache })
  }, [currentUser?._id, fetchConversations])

  // Revalidate the conversation list when the tab regains focus, but only
  // if it's actually gone stale — other devices/tabs can create groups or
  // rename conversations that sockets alone won't always surface here.
  useEffect(() => {
    if (!currentUser?._id) return
    const STALE_AFTER_MS = 30_000
    const revalidate = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - conversationsLastFetchedAtRef.current < STALE_AFTER_MS)
        return
      fetchConversations()
    }
    window.addEventListener('focus', revalidate)
    document.addEventListener('visibilitychange', revalidate)
    return () => {
      window.removeEventListener('focus', revalidate)
      document.removeEventListener('visibilitychange', revalidate)
    }
  }, [currentUser?._id, fetchConversations])

  // Real presence: the only genuine signal the API gives us is "this user's
  // client just sent a message" (via `message:new`, populated below) — no
  // presence endpoint or connect/disconnect broadcast exists for other
  // accounts. Recomputed per render off `conversations`/`lastActiveAt`
  // rather than baked into state, so it never goes stale or defaults to
  // a fake "online".
  const [lastActiveAt, setLastActiveAt] = useState<Record<string, number>>({})
  const enrichedConversations = React.useMemo(
    () => conversations.map((c) => withPresence(c, lastActiveAt)),
    [conversations, lastActiveAt]
  )

  // The live socket signal (above) only ever covers messages sent while
  // this client is connected — on a fresh login/reload there's been no
  // socket activity yet, so "Last seen" stayed blank even for people who
  // messaged us hours ago. `lastMessage` on every conversation already
  // carries the same genuine signal (someone's client sent this at this
  // time) from the initial REST fetch, so seed/refresh from it too. Only
  // ever moves a person's timestamp forward, so it can never overwrite a
  // fresher live signal with a stale REST one.
  useEffect(() => {
    if (!currentUser?._id) return
    setLastActiveAt((prev) => {
      let changed = false
      const next = { ...prev }
      for (const c of conversations) {
        const lm = c.lastMessage
        if (!lm || !('sender' in lm) || !lm.sender || lm.sender === currentUser._id)
          continue
        const ts = new Date(lm.createdAt).getTime()
        if (!next[lm.sender] || ts > next[lm.sender]) {
          next[lm.sender] = ts
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [conversations, currentUser?._id])

  // Fetch each conversation's history the first time it's opened, and cache it.
  // Gated by a ref (not the `messageLoadState` it writes to) — depending on
  // that state here would re-run this effect the instant it calls
  // setMessageLoadState, and the resulting cleanup would cancel the very
  // fetch it just started before it ever resolved.
  const requestedMessageConversationsRef = React.useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!selectedConversationId || !currentUser?._id) return
    const conversationId = selectedConversationId
    const userId = currentUser._id
    if (requestedMessageConversationsRef.current.has(conversationId)) return
    requestedMessageConversationsRef.current.add(conversationId)

    // Hydrate instantly from the last-known page for this conversation (if
    // any) so switching in — including right after a reload — never shows
    // a bare loading state for a conversation we've already seen; the
    // fetch below still always runs to correct anything stale.
    const cached = loadCache<Message[]>(
      messagesCacheKey(userId, conversationId)
    )
    if (cached && cached.length > 0) {
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: cached,
      }))
      setMessageLoadState((prev) => ({ ...prev, [conversationId]: 'loaded' }))
    } else {
      setMessageLoadState((prev) => ({ ...prev, [conversationId]: 'loading' }))
    }

    let cancelled = false
    conversationsApi
      .getMessages(conversationId)
      .then((res) => {
        if (cancelled) return
        const payload = res as MessageListResponse
        const messages = sortMessagesChronologically(payload.messages ?? [])
        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: messages,
        }))
        setMessageLoadState((prev) => ({ ...prev, [conversationId]: 'loaded' }))
        setHasMoreMessages((prev) => ({
          ...prev,
          [conversationId]: payload.hasMore ?? false,
        }))
        saveCache(messagesCacheKey(userId, conversationId), messages)
      })
      .catch((err) => {
        if (cancelled) return
        requestedMessageConversationsRef.current.delete(conversationId)
        // A failed refresh shouldn't blank out messages we already have
        // cached — only surface the error state when there's nothing to
        // fall back to.
        if (!cached || cached.length === 0) {
          setMessageLoadErrors((prev) => ({
            ...prev,
            [conversationId]: err?.error?.message || 'Failed to load messages',
          }))
          setMessageLoadState((prev) => ({ ...prev, [conversationId]: 'error' }))
        }
      })
    return () => {
      cancelled = true
    }
  }, [selectedConversationId, currentUser?._id])

  // Real-time: connect once per session and listen for events from OTHER
  // participants. `message:new` and `conversation:updated` are confirmed
  // working. `typing` is kept wired up in case the server ever relays it,
  // but direct probing of the live server (two real accounts, sniffing
  // every socket event) confirmed it never actually relays a `typing`
  // emit between two different accounts — so this listener is inert
  // against the real API today, not a fake/simulated indicator.
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
      let wasAppended = false
      setMessagesByConversation((prev) => {
        const existing = prev[message.conversation] ?? []
        if (existing.some((m) => m._id === message._id)) return prev
        wasAppended = true
        const next = [...existing, message]
        saveCache(messagesCacheKey(userId, message.conversation), next)
        return { ...prev, [message.conversation]: next }
      })
      bumpConversationPreview(message.conversation, {
        text: message.text,
        sender: message.sender,
        createdAt: message.createdAt,
      })
      setTypingConversationId((current) =>
        current === message.conversation ? null : current
      )
      // Only badge conversations you aren't currently looking at. Being
      // "selected" isn't enough on mobile — after backing out to the list,
      // a conversation stays selected (see handleSelectConversation) but
      // its thread pane isn't the one on screen, so messages arriving
      // there still need a badge. Desktop always shows both panes, so
      // selection alone is sufficient there.
      const isOnScreen =
        message.conversation === selectedConversationIdRef.current &&
        (isDesktopRef.current || mobileViewRef.current === 'thread')
      if (!isOnScreen) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.conversation]: (prev[message.conversation] ?? 0) + 1,
        }))
      }
      // Never for your own sends (already filtered above), and never for
      // a conversation you've muted. Does ring even if that conversation
      // is the one currently open — matches the "notify user" intent;
      // only the sender's own echo is suppressed, per WhatsApp/Slack norms.
      if (wasAppended && !mutedConversationIdsRef.current.has(message.conversation)) {
        playMessageChime()
      }
      // Real presence signal — this user's client just sent something.
      setLastActiveAt((prev) => ({ ...prev, [message.sender]: Date.now() }))
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

    // Polling fallback (per the documented design): only runs while the
    // socket is down, so it never competes with real-time delivery.
    const stopPollingFallback = () => {
      if (pollingRef.current.list) clearInterval(pollingRef.current.list)
      if (pollingRef.current.messages) clearInterval(pollingRef.current.messages)
      pollingRef.current = {}
    }
    const startPollingFallback = () => {
      if (pollingRef.current.list) return // already running
      pollingRef.current.list = setInterval(() => {
        fetchConversations()
      }, 8000)
      pollingRef.current.messages = setInterval(() => {
        const openId = selectedConversationIdRef.current
        if (!openId) return
        conversationsApi
          .getMessages(openId)
          .then((res) => {
            const fetched = sortMessagesChronologically(
              (res as MessageListResponse).messages ?? []
            )
            setMessagesByConversation((prev) => ({
              ...prev,
              [openId]: mergeMessagesById(prev[openId] ?? [], fetched),
            }))
          })
          .catch(() => {})
      }, 2000)
    }

    // Resync after a reconnect (network blip, laptop sleep, a cold-started
    // API server) — the socket alone gives no signal that events were
    // missed while it was down, so treat 'connect' after the first one as
    // "state may be stale" and re-fetch what's currently in view. Messages
    // are merged by _id (not replaced) so anything already delivered live
    // during a partial reconnect isn't clobbered or duplicated.
    const handleConnect = () => {
      stopPollingFallback()
      const isReconnect = socketHasConnectedOnceRef.current
      socketHasConnectedOnceRef.current = true
      if (!isReconnect) return

      fetchConversations()
      const openId = selectedConversationIdRef.current
      if (openId) {
        conversationsApi
          .getMessages(openId)
          .then((res) => {
            const fetched = sortMessagesChronologically(
              (res as MessageListResponse).messages ?? []
            )
            setMessagesByConversation((prev) => ({
              ...prev,
              [openId]: mergeMessagesById(prev[openId] ?? [], fetched),
            }))
          })
          .catch(() => {})
      }
      // Other cached conversations may also be stale — drop the "already
      // fetched" flag so reopening one triggers a fresh load instead of
      // silently showing a gap where missed messages should be.
      requestedMessageConversationsRef.current.forEach((id) => {
        if (id !== openId) requestedMessageConversationsRef.current.delete(id)
      })
    }

    const connectFallbackTimer = setTimeout(() => {
      if (!socketHasConnectedOnceRef.current) startPollingFallback()
    }, 5000)

    socket.on('message:new', handleNewMessage)
    socket.on('conversation:updated', handleConversationUpdated)
    socket.on('typing', handleTypingEvent)
    socket.on('connect', handleConnect)
    socket.on('disconnect', startPollingFallback)

    return () => {
      socket.off('message:new', handleNewMessage)
      socket.off('conversation:updated', handleConversationUpdated)
      socket.off('typing', handleTypingEvent)
      socket.off('connect', handleConnect)
      socket.off('disconnect', startPollingFallback)
      clearTimeout(connectFallbackTimer)
      stopPollingFallback()
    }
  }, [currentUser?._id, fetchConversations])

  const handleLogout = () => {
    disconnectSocket()
    tokenStore.clearToken()
    // AuthContext isn't remounted on client-side navigation, so the stale
    // currentUser must be cleared explicitly — otherwise the landing page's
    // header/CTA would still read as logged in after this redirect.
    setCurrentUser(null)
    // This page instance isn't remounted on a same-tab logout → login
    // either — without resetting these, the next login would silently
    // reopen whatever conversation/pane was showing when this account
    // logged out instead of landing on the chat list.
    setSelectedConversationId(null)
    setMobileView('list')
    setIsDetailsOpen(false)
    router.push('/')
  }

  // Every login/reload lands on the chat list (mobile) or the "select a
  // chat" placeholder (desktop) — no conversation is auto-opened until the
  // user explicitly clicks one, even if a conversation was open in a
  // previous session.
  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
    setJumpTarget(null)
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
  const handleJumpToMessage = (messageId: string) => {
    jumpNonceRef.current += 1
    setJumpTarget({ id: messageId, nonce: jumpNonceRef.current })
  }

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

  const handleTogglePin = (conversationId: string) => {
    setPinnedConversationIds((prev) => {
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

  // Fetches the next page of older history for the given conversation,
  // cursored by the oldest message currently in state (per docs/API.md,
  // `before` is a message-id cursor, not a timestamp).
  const handleLoadOlderMessages = (conversationId: string) => {
    if (loadingOlderMessages[conversationId]) return
    if (hasMoreMessages[conversationId] === false) return
    const oldest = messagesByConversation[conversationId]?.[0]
    if (!oldest) return

    setLoadingOlderMessages((prev) => ({ ...prev, [conversationId]: true }))
    conversationsApi
      .getMessages(conversationId, 20, oldest._id)
      .then((res) => {
        const payload = res as MessageListResponse
        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: mergeMessagesById(
            prev[conversationId] ?? [],
            payload.messages ?? []
          ),
        }))
        setHasMoreMessages((prev) => ({
          ...prev,
          [conversationId]: payload.hasMore ?? false,
        }))
      })
      .catch(() => {})
      .finally(() => {
        setLoadingOlderMessages((prev) => ({ ...prev, [conversationId]: false }))
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
      <>
        <Head>
          <title>Chat — Compass</title>
        </Head>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-secondary">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  const selectedConversation = enrichedConversations.find(
    (c) => c._id === selectedConversationId
  )
  const selectedMessageState = selectedConversationId
    ? messageLoadState[selectedConversationId]
    : undefined

  return (
    <>
      <Head>
        <title>Chat — Compass</title>
      </Head>
      <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0b0b12]">
        <div className="flex h-full w-full overflow-hidden md:contents">
        <div
          className={cn(
            'h-full w-full flex-col bg-white dark:bg-[#0b0b12] md:flex md:h-full md:w-auto md:shrink-0',
            mobileView === 'list' ? 'flex' : 'hidden'
          )}
        >
          <Sidebar
            currentUser={currentUser}
            conversations={enrichedConversations}
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
            pinnedConversationIds={pinnedConversationIds}
            unreadCounts={unreadCounts}
            nicknames={nicknames}
            typingConversationId={typingConversationId}
            isDarkTheme={isDark}
            onToggleTheme={toggleTheme}
          />
          <MobileTabBar
            active="chats"
            onChange={() => {}}
            className="md:hidden"
          />
        </div>

        <div
          className={cn(
            'h-full w-full min-w-0 flex-col bg-white dark:bg-[#0b0b12] md:flex md:h-full md:flex-1',
            mobileView === 'thread' ? 'flex' : 'hidden'
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
                className="flex h-full min-w-0 flex-1 flex-col"
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
                  jumpTarget={jumpTarget}
                  onJumpHandled={() => setJumpTarget(null)}
                  hasMoreMessages={hasMoreMessages[selectedConversation._id] !== false}
                  isLoadingOlderMessages={!!loadingOlderMessages[selectedConversation._id]}
                  onLoadOlderMessages={() =>
                    handleLoadOlderMessages(selectedConversation._id)
                  }
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
          pinned={pinnedConversationIds.has(selectedConversation._id)}
          onTogglePin={() => handleTogglePin(selectedConversation._id)}
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
          onJumpToMessage={handleJumpToMessage}
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
    </>
  )
}
