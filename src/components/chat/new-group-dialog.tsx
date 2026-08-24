import * as React from 'react'
import { Check, Search, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { users as usersApi } from '@/lib/api'
import { ConversationAvatar } from './conversation-avatar'
import type { Conversation, User } from '@/types'

export interface NewGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: User
  conversations: Conversation[]
  onCreateGroup: (name: string, participantIds: string[]) => Promise<void>
  isCreating?: boolean
}

const MIN_ADDITIONAL_MEMBERS = 2

const NewGroupDialog = ({
  open,
  onOpenChange,
  currentUser,
  conversations,
  onCreateGroup,
  isCreating = false,
}: NewGroupDialogProps) => {
  const [groupName, setGroupName] = React.useState('')
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([])
  const [query, setQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<User[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  )

  React.useEffect(() => {
    if (!open) {
      setGroupName('')
      setSelectedUsers([])
      setQuery('')
      setSearchResults([])
      setValidationError(null)
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (q.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    const timeout = setTimeout(() => {
      usersApi
        .search(q)
        .then((res) => setSearchResults((res as User[]) ?? []))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false))
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, open])

  // People from existing conversations, as suggestions before anyone types a search.
  const suggestedUsers = React.useMemo(() => {
    const seen = new Set<string>([currentUser._id])
    const list: User[] = []
    for (const conversation of conversations) {
      const people =
        conversation.type === 'direct'
          ? [conversation.participant]
          : conversation.participants
      for (const person of people) {
        if (!seen.has(person._id)) {
          seen.add(person._id)
          list.push(person)
        }
      }
    }
    return list
  }, [conversations, currentUser._id])

  const visibleUsers = query.trim().length >= 2 ? searchResults : suggestedUsers
  const selectableUsers = visibleUsers.filter((u) => u._id !== currentUser._id)

  const toggleUser = (user: User) => {
    setValidationError(null)
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    )
  }

  const handleSubmit = async () => {
    const trimmedName = groupName.trim()
    if (!trimmedName) {
      setValidationError('Group name is required')
      return
    }
    if (selectedUsers.length < MIN_ADDITIONAL_MEMBERS) {
      setValidationError(
        `Add at least ${MIN_ADDITIONAL_MEMBERS} more members (3 people total)`
      )
      return
    }
    setValidationError(null)
    await onCreateGroup(
      trimmedName,
      selectedUsers.map((u) => u._id)
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-w-sm">
        <DialogHeader className="shrink-0 px-5 pt-5">
          <DialogTitle>New Group</DialogTitle>
        </DialogHeader>

        <div className="shrink-0 px-5 pt-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
            Group name
          </label>
          <input
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value)
              setValidationError(null)
            }}
            placeholder="e.g. Weekend Crew 🎉"
            className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        {selectedUsers.length > 0 && (
          <div className="shrink-0 flex flex-wrap gap-2 px-5 pt-3">
            {selectedUsers.map((user) => (
              <span
                key={user._id}
                className="flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-3 pr-1.5 text-sm font-medium text-primary"
              >
                {user.name.split(' ')[0]}
                <button
                  type="button"
                  aria-label={`Remove ${user.name}`}
                  onClick={() => toggleUser(user)}
                  className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-primary/20"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="shrink-0 px-5 pb-2 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
            Add members (min {MIN_ADDITIONAL_MEMBERS})
          </label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or phone"
              className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2">
          {query.trim().length >= 2 && isSearching ? (
            <p className="px-3 py-6 text-center text-sm text-secondary">
              Searching…
            </p>
          ) : selectableUsers.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-secondary">
              {query.trim().length >= 2
                ? 'No users found'
                : 'Type at least 2 characters to search'}
            </p>
          ) : (
            selectableUsers.map((user) => {
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

        <div className="shrink-0 space-y-3 border-t border-gray-100 px-5 py-4">
          {validationError && (
            <p className="text-sm font-medium text-red-500">
              {validationError}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">
              {selectedUsers.length} selected
            </span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? 'Creating…' : 'Create Group'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { NewGroupDialog }
