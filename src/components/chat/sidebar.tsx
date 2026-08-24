import * as React from 'react'
import { LogOut, Moon, Plus, Search, Sun, Users } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
  Logo,
  PillTabs,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { getConversationAvatarUser, getConversationName } from '@/lib/conversation'
import { users as usersApi } from '@/lib/api'
import { ConversationAvatar } from './conversation-avatar'
import { ConversationListItem } from './conversation-list-item'
import type { Conversation, User } from '@/types'

type ConversationFilterTab = 'all' | 'direct' | 'group'

const FILTER_TABS: { key: ConversationFilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'direct', label: 'Messages' },
  { key: 'group', label: 'Group' },
]

export interface SidebarProps {
  currentUser: User
  conversations: Conversation[]
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
  onLogout: () => void
  onNewChat?: () => void
  onNewGroup?: () => void
  onStartUserChat?: (user: User) => void
  startingUserId?: string | null
  isLoading?: boolean
  loadError?: string | null
  mutedConversationIds?: Set<string>
  pinnedConversationIds?: Set<string>
  nicknames?: Record<string, string>
  unreadCounts?: Record<string, number>
  typingConversationId?: string | null
  className?: string
  isDarkTheme?: boolean
  onToggleTheme?: () => void
}

const Sidebar = ({
  currentUser,
  conversations,
  selectedConversationId,
  onSelectConversation,
  onLogout,
  onNewChat,
  onNewGroup,
  onStartUserChat,
  startingUserId,
  isLoading = false,
  loadError = null,
  mutedConversationIds,
  pinnedConversationIds,
  nicknames,
  unreadCounts,
  typingConversationId,
  className,
  isDarkTheme = false,
  onToggleTheme,
}: SidebarProps) => {
  const [query, setQuery] = React.useState('')
  const [userResults, setUserResults] = React.useState<User[]>([])
  const [isSearchingUsers, setIsSearchingUsers] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<ConversationFilterTab>('all')

  const filteredConversations = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const byQuery = !q
      ? conversations
      : conversations.filter((c) => {
          if (getConversationName(c).toLowerCase().includes(q)) return true
          if (c.type === 'direct') {
            return c.participant?.phone?.toLowerCase().includes(q) ?? false
          }
          return (
            c.participants?.some(
              (p) =>
                p.name?.toLowerCase().includes(q) ||
                p.phone?.toLowerCase().includes(q)
            ) ?? false
          )
        })

    const byTab =
      activeTab === 'all'
        ? byQuery
        : byQuery.filter((c) => c.type === activeTab)

    // Pinned conversations always float to the top, in their existing
    // relative order — same convention as WhatsApp/Telegram's "pin chat".
    if (!pinnedConversationIds?.size) return byTab
    return [...byTab].sort((a, b) => {
      const aPinned = pinnedConversationIds.has(a._id)
      const bPinned = pinnedConversationIds.has(b._id)
      if (aPinned === bPinned) return 0
      return aPinned ? -1 : 1
    })
  }, [conversations, query, activeTab, pinnedConversationIds])

  // Search the API for people too, not just local conversations — so
  // "search or start new chat" actually finds someone you haven't messaged yet.
  React.useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setUserResults([])
      setIsSearchingUsers(false)
      return
    }
    setIsSearchingUsers(true)
    const timeout = setTimeout(() => {
      usersApi
        .search(q)
        .then((res) => setUserResults((res as User[]) ?? []))
        .catch(() => setUserResults([]))
        .finally(() => setIsSearchingUsers(false))
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  const recentContacts = React.useMemo(() => {
    const seen = new Set<string>()
    const contacts: { conversationId: string; user: User }[] = []
    for (const conversation of conversations) {
      const user = getConversationAvatarUser(conversation)
      if (user && !seen.has(user._id)) {
        seen.add(user._id)
        contacts.push({ conversationId: conversation._id, user })
      }
      if (contacts.length >= 6) break
    }
    return contacts
  }, [conversations])

  return (
    <aside
      className={cn(
        'flex min-h-0 w-full flex-1 flex-col bg-white dark:bg-[#0b0b12] md:h-full md:max-w-[370px] md:shrink-0 md:border-r md:border-gray-200 dark:md:border-white/10',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <Logo variant={isDarkTheme ? 'light' : 'dark'} />

        <div className="hidden items-center gap-1 md:flex">
          <IconButton
            icon={<Users className="h-5 w-5" />}
            label="New group"
            onClick={onNewGroup}
          />
          <IconButton
            icon={
              isDarkTheme ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            }
            label="Toggle theme"
            onClick={onToggleTheme}
          />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <IconButton
            icon={<Users className="h-5 w-5" />}
            label="New group"
            onClick={onNewGroup}
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Account menu"
            >
              <ConversationAvatar name={currentUser.name} size="sm" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onToggleTheme}>
                {isDarkTheme ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                Toggle theme
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onLogout}>
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-4 pb-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {recentContacts.length > 0 && (
        <div
          onWheel={(e) => {
            if (e.deltaY === 0) return
            e.currentTarget.scrollLeft += e.deltaY
          }}
          className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-5 pt-2"
        >
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <ConversationAvatar name={currentUser.name} size="lg" ring="primary" />
            <span className="text-xs text-secondary">Me</span>
          </div>
          {recentContacts.map(({ conversationId, user }) => (
            <button
              key={user._id}
              type="button"
              onClick={() => onSelectConversation(conversationId)}
              className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ConversationAvatar name={user.name} size="lg" ring="accent" />
              <span className="max-w-14 truncate text-xs text-secondary">
                {user.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Chats
        </span>
        <IconButton
          icon={<Plus className="h-4 w-4" />}
          label="Start new chat"
          size="sm"
          onClick={onNewChat}
        />
      </div>

      <div className="px-4 pb-3">
        <PillTabs options={FILTER_TABS} value={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto dark:bg-[#0b0b12]">
        {isLoading ? (
          <p className="px-4 py-8 text-center text-sm text-secondary">
            Loading conversations…
          </p>
        ) : loadError ? (
          <p className="px-4 py-8 text-center text-sm text-red-500">
            {loadError}
          </p>
        ) : filteredConversations.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-secondary">
            {query.trim()
              ? 'No conversations found'
              : 'No conversations yet — start a new chat'}
          </p>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationListItem
              key={conversation._id}
              conversation={conversation}
              isActive={conversation._id === selectedConversationId}
              muted={mutedConversationIds?.has(conversation._id)}
              pinned={pinnedConversationIds?.has(conversation._id)}
              nickname={nicknames?.[conversation._id]}
              unreadCount={unreadCounts?.[conversation._id] ?? 0}
              isTyping={typingConversationId === conversation._id}
              onClick={() => onSelectConversation(conversation._id)}
            />
          ))
        )}

        {query.trim().length >= 2 && (
          <div className="border-t border-gray-100 py-2 dark:border-white/10">
            <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-secondary">
              People
            </p>
            {isSearchingUsers ? (
              <p className="px-4 py-3 text-center text-sm text-secondary">
                Searching…
              </p>
            ) : userResults.length === 0 ? (
              <p className="px-4 py-3 text-center text-sm text-secondary">
                No users found
              </p>
            ) : (
              userResults
                .filter((user) => user._id !== currentUser._id)
                .map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => onStartUserChat?.(user)}
                    disabled={startingUserId === user._id}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 disabled:opacity-60 dark:hover:bg-white/5"
                  >
                    <ConversationAvatar name={user.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-secondary">
                        {user.phone}
                      </p>
                    </div>
                    {startingUserId === user._id && (
                      <span className="shrink-0 text-xs text-secondary">
                        Starting…
                      </span>
                    )}
                  </button>
                ))
            )}
          </div>
        )}
      </div>

      <div className="hidden items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-white/10 md:flex">
        <div className="flex min-w-0 items-center gap-3">
          <ConversationAvatar name={currentUser.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {currentUser.name}
            </p>
            <p className="truncate text-xs text-secondary">{currentUser.phone}</p>
          </div>
        </div>
        <IconButton
          icon={<LogOut className="h-5 w-5" />}
          label="Log out"
          onClick={onLogout}
        />
      </div>
    </aside>
  )
}

export { Sidebar }
