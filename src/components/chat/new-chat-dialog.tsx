import * as React from 'react'
import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { users as usersApi } from '@/lib/api'
import { ConversationAvatar } from './conversation-avatar'
import type { User } from '@/types'

export interface NewChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectUser: (user: User) => void
  startingUserId?: string | null
}

const NewChatDialog = ({
  open,
  onOpenChange,
  onSelectUser,
  startingUserId,
}: NewChatDialogProps) => {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<User[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      setError(null)
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setError(null)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timeout = setTimeout(() => {
      usersApi
        .search(q)
        .then((res) => {
          setResults((res as User[]) ?? [])
          setError(null)
        })
        .catch((err) => {
          setError(err?.error?.message || 'Failed to search users')
        })
        .finally(() => setIsSearching(false))
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-w-sm">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>New chat</DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-2 pt-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or phone"
              className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto px-2 pb-4">
          {query.trim().length < 2 ? (
            <p className="px-3 py-6 text-center text-sm text-secondary">
              Type at least 2 characters to search
            </p>
          ) : isSearching ? (
            <p className="px-3 py-6 text-center text-sm text-secondary">
              Searching…
            </p>
          ) : error ? (
            <p className="px-3 py-6 text-center text-sm text-red-500">
              {error}
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-secondary">
              No users found
            </p>
          ) : (
            results.map((user) => (
              <button
                key={user._id}
                type="button"
                onClick={() => onSelectUser(user)}
                disabled={startingUserId === user._id}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                <ConversationAvatar name={user.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
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
      </DialogContent>
    </Dialog>
  )
}

export { NewChatDialog }
