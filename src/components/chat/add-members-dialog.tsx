import * as React from 'react'
import { Check, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { users as usersApi } from '@/lib/api'
import { ConversationAvatar } from './conversation-avatar'
import type { ConversationGroup, User } from '@/types'

export interface AddMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversation: ConversationGroup
  onAddMembers: (userIds: string[]) => Promise<void>
  isAdding?: boolean
}

const AddMembersDialog = ({
  open,
  onOpenChange,
  conversation,
  onAddMembers,
  isAdding = false,
}: AddMembersDialogProps) => {
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([])
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<User[]>([])
  const [isSearching, setIsSearching] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setSelectedUsers([])
      setQuery('')
      setResults([])
    }
  }, [open])

  const existingIds = React.useMemo(
    () => new Set(conversation.participants.map((p) => p._id)),
    [conversation.participants]
  )

  React.useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    const timeout = setTimeout(() => {
      usersApi
        .search(q)
        .then((res) => setResults((res as User[]) ?? []))
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false))
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, open])

  const selectableResults = results.filter((u) => !existingIds.has(u._id))

  const toggleUser = (user: User) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    )
  }

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) return
    await onAddMembers(selectedUsers.map((u) => u._id))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-w-sm">
        <DialogHeader className="shrink-0 px-5 pt-5">
          <DialogTitle>Add members</DialogTitle>
        </DialogHeader>

        <div className="shrink-0 px-5 pb-2 pt-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or phone"
              className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {query.trim().length < 2 ? (
            <p className="px-3 py-6 text-center text-sm text-secondary">
              Type at least 2 characters to search
            </p>
          ) : isSearching ? (
            <p className="px-3 py-6 text-center text-sm text-secondary">
              Searching…
            </p>
          ) : selectableResults.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-secondary">
              No users found
            </p>
          ) : (
            selectableResults.map((user) => {
              const isSelected = selectedUsers.some((u) => u._id === user._id)
              return (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => toggleUser(user)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
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
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-gray-300 bg-white'
                    )}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </span>
                </button>
              )
            })
          )}
        </div>

        <div className="shrink-0 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isAdding || selectedUsers.length === 0}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAdding
              ? 'Adding…'
              : selectedUsers.length === 0
                ? 'Add members'
                : `Add ${selectedUsers.length} member${selectedUsers.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { AddMembersDialog }
