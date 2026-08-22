import * as React from 'react'
import { LogOut, Moon, Plus, Search, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage, Logo } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  getConversationAvatarUser,
  getConversationInitials,
  getConversationName,
} from '@/lib/conversation'
import { ConversationListItem } from './conversation-list-item'
import type { Conversation, User } from '@/types'

export interface SidebarProps {
  currentUser: User
  conversations: Conversation[]
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
  onLogout: () => void
  className?: string
}

const Sidebar = ({
  currentUser,
  conversations,
  selectedConversationId,
  onSelectConversation,
  onLogout,
  className,
}: SidebarProps) => {
  const [query, setQuery] = React.useState('')

  const filteredConversations = React.useMemo(() => {
    if (!query.trim()) return conversations
    const q = query.trim().toLowerCase()
    return conversations.filter((c) =>
      getConversationName(c).toLowerCase().includes(q)
    )
  }, [conversations, query])

  const recentContacts = React.useMemo(() => {
    const seen = new Set<string>()
    const contacts: User[] = []
    for (const conversation of conversations) {
      const user = getConversationAvatarUser(conversation)
      if (user && !seen.has(user._id)) {
        seen.add(user._id)
        contacts.push(user)
      }
      if (contacts.length >= 6) break
    }
    return contacts
  }, [conversations])

  return (
    <aside
      className={cn(
        'flex h-full w-full max-w-[370px] shrink-0 flex-col border-r border-gray-200 bg-white',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <Logo variant="dark" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Contacts"
            className="flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-gray-100"
          >
            <Users className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-gray-100"
          >
            <Moon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      {recentContacts.length > 0 && (
        <div className="flex gap-4 overflow-x-auto px-4 pb-4">
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <Avatar className="h-12 w-12 ring-2 ring-primary ring-offset-2">
              <AvatarFallback>
                {currentUser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-secondary">Me</span>
          </div>
          {recentContacts.map((user) => (
            <div
              key={user._id}
              className="flex shrink-0 flex-col items-center gap-1.5"
            >
              <Avatar className="h-12 w-12 ring-2 ring-accent ring-offset-2">
                <AvatarImage alt={user.name} />
                <AvatarFallback>
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-14 truncate text-xs text-secondary">
                {user.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Chats
        </span>
        <button
          type="button"
          aria-label="Start new chat"
          className="flex h-7 w-7 items-center justify-center rounded-full text-secondary transition-colors hover:bg-gray-100"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-secondary">
            No conversations found
          </p>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationListItem
              key={conversation._id}
              conversation={conversation}
              isActive={conversation._id === selectedConversationId}
              onClick={() => onSelectConversation(conversation._id)}
            />
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {currentUser.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {currentUser.name}
            </p>
            <p className="truncate text-xs text-secondary">{currentUser.phone}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Log out"
          onClick={onLogout}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-gray-100"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  )
}

export { Sidebar }
