import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Bell,
  BellOff,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Link2,
  LogOut,
  Mic,
  Pencil,
  Pin,
  Search,
  Shield,
  Smile,
  Type,
  User,
  UserMinus,
  Video,
  X,
} from 'lucide-react'
import {
  IconButton,
  EmojiPickerComponent,
  EmojiPickerGrid,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { cn, slugifyHandle } from '@/lib/utils'
import { getConversationName } from '@/lib/conversation'
import { extractLinks } from '@/lib/message'
import { formatRelativeTime } from '@/lib/conversation'
import { CHAT_THEME_SWATCHES } from '@/lib/theme'
import { ConversationAvatar } from './conversation-avatar'
import type { Conversation, Message } from '@/types'

export interface ChatDetailsPanelProps {
  isOpen: boolean
  onClose: () => void
  conversation: Conversation
  messages: Message[]
  currentUserId: string
  muted?: boolean
  onToggleMute?: () => void
  pinned?: boolean
  onTogglePin?: () => void
  nickname?: string
  onSetNickname?: (nickname: string | undefined) => void
  accentColor?: string
  onSetAccentColor?: (color: string | undefined) => void
  quickEmoji?: string
  onSetQuickEmoji?: (emoji: string | undefined) => void
  onRemoveParticipant?: (userId: string) => void
  removingParticipantId?: string | null
  onLeaveGroup?: () => void
  isLeavingGroup?: boolean
  onRenameGroup?: (name: string) => void
  onOpenAddMembers?: () => void
  className?: string
}

type SubView = 'root' | 'profile' | 'pinned' | 'media' | 'files' | 'links'
type CustomizeField = 'theme' | 'emoji' | 'nickname' | null

// md breakpoint (768px) — matches the Tailwind `md:` prefix used everywhere
// else in this app, so "mobile" here means the same thing it does in CSS.
const MOBILE_MEDIA_QUERY = '(max-width: 767px)'

const SUBVIEW_TITLES: Record<Exclude<SubView, 'root'>, string> = {
  profile: 'Profile',
  pinned: 'Pinned messages',
  media: 'Media',
  files: 'Files',
  links: 'Links',
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-100 px-1.5 text-xs font-medium text-secondary dark:bg-white/10">
      {children}
    </span>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="border-b border-gray-100 dark:border-white/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Row({
  icon,
  iconBg,
  label,
  meta,
  onClick,
  expanded,
  hideChevron = false,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  meta?: React.ReactNode
  onClick?: () => void
  expanded?: boolean
  hideChevron?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/5"
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          iconBg
        )}
      >
        {icon}
      </span>
      <span className="flex-1 truncate text-sm text-gray-900 dark:text-white">{label}</span>
      {meta}
      {!hideChevron && (
        <ChevronRight
          className={cn(
            'h-4 w-4 shrink-0 text-gray-300 transition-transform',
            expanded && 'rotate-90'
          )}
        />
      )}
    </button>
  )
}

function QuickAction({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5"
    >
      <span
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full border transition-colors',
          active
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-gray-200 text-secondary hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5'
        )}
      >
        {icon}
      </span>
      <span className="text-xs text-secondary">{label}</span>
    </button>
  )
}

function SubViewEmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode
  message: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-white/10">
        {icon}
      </span>
      <p className="text-sm text-secondary">{message}</p>
    </div>
  )
}

const ChatDetailsPanel = ({
  isOpen,
  onClose,
  conversation,
  messages,
  currentUserId,
  muted = false,
  onToggleMute,
  pinned = false,
  onTogglePin,
  nickname,
  onSetNickname,
  accentColor,
  onSetAccentColor,
  quickEmoji,
  onSetQuickEmoji,
  onRemoveParticipant,
  removingParticipantId,
  onLeaveGroup,
  isLeavingGroup = false,
  onRenameGroup,
  onOpenAddMembers,
  className,
}: ChatDetailsPanelProps) => {
  const shouldReduceMotion = useReducedMotion()
  const offset = shouldReduceMotion ? 0 : 24

  const [view, setView] = React.useState<SubView>('root')
  const [isSearching, setIsSearching] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [customizeField, setCustomizeField] = React.useState<CustomizeField>(null)
  const [isEmojiModalOpen, setIsEmojiModalOpen] = React.useState(false)
  const [nicknameDraft, setNicknameDraft] = React.useState(nickname ?? '')
  const [isEditingGroupName, setIsEditingGroupName] = React.useState(false)
  const [confirmTarget, setConfirmTarget] = React.useState<
    { type: 'remove'; userId: string; userName: string } | { type: 'leave' } | null
  >(null)
  const [groupNameDraft, setGroupNameDraft] = React.useState(
    conversation.type === 'group' ? conversation.name : ''
  )

  React.useEffect(() => {
    if (!isOpen) {
      setView('root')
      setIsSearching(false)
      setSearchQuery('')
      setCustomizeField(null)
      setIsEmojiModalOpen(false)
      setIsEditingGroupName(false)
      setConfirmTarget(null)
    }
  }, [isOpen])

  React.useEffect(() => {
    setView('root')
    setIsSearching(false)
    setSearchQuery('')
    setCustomizeField(null)
    setIsEditingGroupName(false)
    setGroupNameDraft(conversation.type === 'group' ? conversation.name : '')
  }, [conversation._id])

  React.useEffect(() => {
    setNicknameDraft(nickname ?? '')
  }, [nickname])

  React.useEffect(() => {
    if (conversation.type === 'group' && !isEditingGroupName) {
      setGroupNameDraft(conversation.name)
    }
    // isEditingGroupName intentionally excluded — only re-sync when the name itself changes.
  }, [conversation.type === 'group' ? conversation.name : null])

  const displayName = nickname || getConversationName(conversation)
  const handle =
    conversation.type === 'direct'
      ? `@${slugifyHandle(conversation.participant.name)}`
      : `@${slugifyHandle(conversation.name)}`

  const links = React.useMemo(() => extractLinks(messages), [messages])

  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return messages
      .filter((m) => m.text.toLowerCase().includes(q))
      .slice()
      .reverse()
  }, [messages, searchQuery])

  const commitNickname = () => {
    const trimmed = nicknameDraft.trim()
    onSetNickname?.(trimmed.length > 0 ? trimmed : undefined)
    setCustomizeField(null)
  }

  // Mobile has no room for a floating popover next to the row, so "Change
  // emoji" opens as a full modal there; desktop keeps the inline expand +
  // popover it always had.
  const handleChangeEmojiClick = () => {
    const isMobile = window.matchMedia(MOBILE_MEDIA_QUERY).matches
    if (isMobile) {
      setIsEmojiModalOpen(true)
    } else {
      setCustomizeField((f) => (f === 'emoji' ? null : 'emoji'))
    }
  }

  const commitGroupName = () => {
    const trimmed = groupNameDraft.trim()
    if (trimmed.length > 0 && conversation.type === 'group') {
      onRenameGroup?.(trimmed)
    } else if (conversation.type === 'group') {
      setGroupNameDraft(conversation.name)
    }
    setIsEditingGroupName(false)
  }

  const isGroup = conversation.type === 'group'
  const isCurrentUserAdmin = isGroup && conversation.admins.includes(currentUserId)

  const headerTitle =
    view === 'root'
      ? isGroup
        ? 'Group Info'
        : 'Chat Details'
      : SUBVIEW_TITLES[view]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ opacity: 0, x: offset }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: offset }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            // Always an overlay, never a layout sibling — on desktop it floats
            // above the thread pane instead of shrinking it (that shrinking is
            // what was pushing the composer/header into overflow).
            'fixed inset-y-0 right-0 z-40 flex h-full w-full flex-col bg-white shadow-2xl dark:bg-[#0b0b12] md:w-[320px] md:border-l md:border-gray-200 dark:md:border-white/10',
            className
          )}
        >
          <div className="flex h-[73px] shrink-0 items-center justify-between border-b border-gray-200 px-4 dark:border-white/10">
            <div className="flex min-w-0 items-center gap-1">
              {view !== 'root' && (
                <IconButton
                  icon={<ChevronLeft className="h-5 w-5" />}
                  label="Back"
                  onClick={() => setView('root')}
                />
              )}
              <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {headerTitle}
              </span>
            </div>
            <IconButton
              icon={<X className="h-5 w-5" />}
              label="Close details"
              onClick={onClose}
            />
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto">
            {view === 'root' && isGroup && conversation.type === 'group' && (
              <>
                <div className="flex flex-col items-center gap-1 px-4 pb-5 pt-6 text-center">
                  <ConversationAvatar
                    name={displayName}
                    size="lg"
                    className="h-20 w-20 text-xl"
                  />
                  {isEditingGroupName ? (
                    <div className="mt-3 flex items-center gap-1.5">
                      <input
                        autoFocus
                        type="text"
                        value={groupNameDraft}
                        onChange={(e) => setGroupNameDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitGroupName()
                          if (e.key === 'Escape') {
                            setGroupNameDraft(conversation.name)
                            setIsEditingGroupName(false)
                          }
                        }}
                        onBlur={commitGroupName}
                        className="h-8 rounded-full border border-gray-200 bg-gray-50 px-3 text-center text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-1.5">
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {displayName}
                      </p>
                      {isCurrentUserAdmin && (
                        <IconButton
                          icon={<Pencil className="h-3.5 w-3.5" />}
                          label="Edit group name"
                          size="sm"
                          onClick={() => setIsEditingGroupName(true)}
                        />
                      )}
                    </div>
                  )}
                  <p className="text-sm text-secondary">
                    {conversation.participants.length} members
                  </p>
                </div>

                <div className="flex items-center justify-center gap-8 pb-5">
                  <QuickAction icon={<Mic className="h-5 w-5" />} label="Voice" />
                  <QuickAction icon={<Video className="h-5 w-5" />} label="Video" />
                  <QuickAction
                    icon={<Pin className="h-5 w-5" />}
                    label={pinned ? 'Unpin' : 'Pin chat'}
                    active={pinned}
                    onClick={onTogglePin}
                  />
                  <QuickAction
                    icon={<Search className="h-5 w-5" />}
                    label="Search"
                    active={isSearching}
                    onClick={() => setIsSearching((s) => !s)}
                  />
                </div>

                {isSearching ? (
                  <div className="flex flex-1 flex-col border-t border-gray-100 dark:border-white/10">
                    <div className="px-4 py-3">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" />
                        <input
                          autoFocus
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search in this chat"
                          className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-2 pb-4">
                      {!searchQuery.trim() ? (
                        <p className="px-2 py-6 text-center text-sm text-secondary">
                          Type to search messages in this chat
                        </p>
                      ) : searchResults.length === 0 ? (
                        <p className="px-2 py-6 text-center text-sm text-secondary">
                          No messages found
                        </p>
                      ) : (
                        searchResults.map((m) => (
                          <div
                            key={m._id}
                            className="rounded-xl px-2 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5"
                          >
                            <p className="line-clamp-2 text-sm text-gray-900 dark:text-white">
                              {m.text}
                            </p>
                            <p className="mt-0.5 text-xs text-secondary">
                              {formatRelativeTime(m.createdAt)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-100 px-4 py-4 dark:border-white/10">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Members ({conversation.participants.length})
                      </span>
                      {isCurrentUserAdmin && (
                        <button
                          type="button"
                          onClick={onOpenAddMembers}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {conversation.participants.map((p) => {
                        const isSelf = p._id === currentUserId
                        const isRemoving = removingParticipantId === p._id
                        return (
                          <div
                            key={p._id}
                            className="flex items-center gap-3 rounded-xl px-1 py-2"
                          >
                            <ConversationAvatar name={p.name} size="sm" />
                            <span className="flex-1 truncate text-sm text-gray-900 dark:text-white">
                              {isSelf ? `${p.name} (You)` : p.name}
                            </span>
                            {conversation.admins.includes(p._id) && (
                              <span className="flex items-center gap-1 text-xs font-medium text-primary">
                                <Shield className="h-3.5 w-3.5" />
                                Admin
                              </span>
                            )}
                            {isCurrentUserAdmin && !isSelf && (
                              <IconButton
                                icon={<UserMinus className="h-4 w-4" />}
                                label={`Remove ${p.name}`}
                                size="sm"
                                disabled={isRemoving}
                                onClick={() =>
                                  setConfirmTarget({
                                    type: 'remove',
                                    userId: p._id,
                                    userName: p.name,
                                  })
                                }
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setConfirmTarget({ type: 'leave' })}
                      disabled={isLeavingGroup}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/30 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      {isLeavingGroup ? 'Leaving…' : 'Leave group'}
                    </button>
                  </div>
                )}
              </>
            )}

            {view === 'root' && !isGroup && (
              <>
                <div className="flex flex-col items-center gap-1 px-4 pb-5 pt-6 text-center">
                  <ConversationAvatar
                    name={displayName}
                    size="lg"
                    className="h-20 w-20 text-xl"
                  />
                  <p className="mt-3 text-base font-semibold text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                  <p className="text-sm text-secondary">{handle}</p>
                </div>

                <div className="flex items-center justify-center gap-8 pb-5">
                  <QuickAction
                    icon={<User className="h-5 w-5" />}
                    label="Profile"
                    onClick={() => setView('profile')}
                  />
                  <QuickAction
                    icon={
                      muted ? (
                        <BellOff className="h-5 w-5" />
                      ) : (
                        <Bell className="h-5 w-5" />
                      )
                    }
                    label={muted ? 'Unmute' : 'Mute'}
                    active={muted}
                    onClick={onToggleMute}
                  />
                  <QuickAction
                    icon={<Pin className="h-5 w-5" />}
                    label={pinned ? 'Unpin' : 'Pin chat'}
                    active={pinned}
                    onClick={onTogglePin}
                  />
                  <QuickAction
                    icon={<Search className="h-5 w-5" />}
                    label="Search"
                    active={isSearching}
                    onClick={() => setIsSearching((s) => !s)}
                  />
                </div>

                {isSearching ? (
                  <div className="flex flex-1 flex-col border-t border-gray-100 dark:border-white/10">
                    <div className="px-4 py-3">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" />
                        <input
                          autoFocus
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search in this chat"
                          className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-2 pb-4">
                      {!searchQuery.trim() ? (
                        <p className="px-2 py-6 text-center text-sm text-secondary">
                          Type to search messages in this chat
                        </p>
                      ) : searchResults.length === 0 ? (
                        <p className="px-2 py-6 text-center text-sm text-secondary">
                          No messages found
                        </p>
                      ) : (
                        searchResults.map((m) => (
                          <div
                            key={m._id}
                            className="rounded-xl px-2 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5"
                          >
                            <p className="line-clamp-2 text-sm text-gray-900 dark:text-white">
                              {m.text}
                            </p>
                            <p className="mt-0.5 text-xs text-secondary">
                              {formatRelativeTime(m.createdAt)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <Section title="Chat info">
                      <Row
                        icon={<Pin className="h-4 w-4" />}
                        iconBg="bg-rose-50 text-rose-500 dark:bg-rose-500/10"
                        label="View pinned messages"
                        meta={<Badge>0</Badge>}
                        onClick={() => setView('pinned')}
                      />
                    </Section>

                    <Section title="Customize chat">
                      <div>
                        <Row
                          icon={<div className="h-4 w-4 rounded-full bg-current" />}
                          iconBg="bg-blue-50 text-blue-500 dark:bg-blue-500/10"
                          label="Change theme"
                          expanded={customizeField === 'theme'}
                          onClick={() =>
                            setCustomizeField((f) =>
                              f === 'theme' ? null : 'theme'
                            )
                          }
                        />
                        {customizeField === 'theme' && (
                          <div className="flex flex-wrap gap-2.5 py-1 pb-3 pl-16 pr-4">
                            {CHAT_THEME_SWATCHES.map((swatch) => {
                              const isSelected =
                                swatch.id === 'default'
                                  ? !accentColor
                                  : accentColor === swatch.color
                              return (
                                <button
                                  key={swatch.id}
                                  type="button"
                                  aria-label={swatch.label}
                                  onClick={() =>
                                    onSetAccentColor?.(
                                      swatch.id === 'default'
                                        ? undefined
                                        : swatch.color
                                    )
                                  }
                                  style={{ backgroundColor: swatch.color }}
                                  className={cn(
                                    'flex h-7 w-7 items-center justify-center rounded-full ring-offset-2 transition-shadow dark:ring-offset-[#0b0b12]',
                                    isSelected && 'ring-2 ring-gray-900 dark:ring-white'
                                  )}
                                >
                                  {isSelected && (
                                    <Check className="h-4 w-4 text-white" />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      <div>
                        <Row
                          icon={<Smile className="h-4 w-4" />}
                          iconBg="bg-amber-50 text-amber-500 dark:bg-amber-500/10"
                          label="Change emoji"
                          meta={<span className="text-base">{quickEmoji ?? '👍'}</span>}
                          hideChevron
                          onClick={handleChangeEmojiClick}
                        />
                        {customizeField === 'emoji' && (
                          <div className="flex items-center gap-3 py-1 pb-3 pl-16 pr-4">
                            <EmojiPickerComponent
                              onEmojiSelect={(emoji) => onSetQuickEmoji?.(emoji)}
                              size="sm"
                              closeOnSelect={false}
                            />
                            {quickEmoji && (
                              <button
                                type="button"
                                onClick={() => onSetQuickEmoji?.(undefined)}
                                className="text-xs text-secondary hover:text-gray-700 hover:underline dark:hover:text-white"
                              >
                                Reset to default
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <Row
                          icon={<Type className="h-4 w-4" />}
                          iconBg="bg-violet-50 text-violet-500 dark:bg-violet-500/10"
                          label="Edit nickname"
                          expanded={customizeField === 'nickname'}
                          onClick={() =>
                            setCustomizeField((f) =>
                              f === 'nickname' ? null : 'nickname'
                            )
                          }
                        />
                        {customizeField === 'nickname' && (
                          <div className="flex items-center gap-2 py-1 pb-3 pl-16 pr-4">
                            <input
                              autoFocus
                              type="text"
                              value={nicknameDraft}
                              onChange={(e) => setNicknameDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitNickname()
                                if (e.key === 'Escape') setCustomizeField(null)
                              }}
                              placeholder={getConversationName(conversation)}
                              className="h-9 flex-1 rounded-full border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                            />
                            <button
                              type="button"
                              onClick={commitNickname}
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                    </Section>

                    <Section title="Media, files and links">
                      <Row
                        icon={<ImageIcon className="h-4 w-4" />}
                        iconBg="bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10"
                        label="Media"
                        meta={<Badge>0</Badge>}
                        onClick={() => setView('media')}
                      />
                      <Row
                        icon={<FileText className="h-4 w-4" />}
                        iconBg="bg-orange-50 text-orange-500 dark:bg-orange-500/10"
                        label="Files"
                        meta={<Badge>0</Badge>}
                        onClick={() => setView('files')}
                      />
                      <Row
                        icon={<Link2 className="h-4 w-4" />}
                        iconBg="bg-sky-50 text-sky-500 dark:bg-sky-500/10"
                        label="Links"
                        meta={<Badge>{links.length}</Badge>}
                        onClick={() => setView('links')}
                      />
                    </Section>
                  </>
                )}
              </>
            )}

            {view === 'profile' && conversation.type === 'direct' && (
              <div className="flex flex-1 flex-col">
                <div className="flex flex-col items-center gap-1 px-4 pb-6 pt-8 text-center">
                  <ConversationAvatar
                    name={displayName}
                    size="lg"
                    className="h-24 w-24 text-2xl"
                  />
                  <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                  <p className="text-sm text-secondary">{handle}</p>
                </div>

                <div className="space-y-3 border-t border-gray-100 px-4 py-4 dark:border-white/10">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                      Phone
                    </p>
                    <p className="mt-0.5 text-sm text-gray-900 dark:text-white">
                      {conversation.participant.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {view === 'pinned' && (
              <SubViewEmptyState
                icon={<Pin className="h-5 w-5" />}
                message="No pinned messages yet"
              />
            )}

            {view === 'media' && (
              <SubViewEmptyState
                icon={<ImageIcon className="h-5 w-5" />}
                message="No photos or videos shared yet"
              />
            )}

            {view === 'files' && (
              <SubViewEmptyState
                icon={<FileText className="h-5 w-5" />}
                message="No files shared yet"
              />
            )}

            {view === 'links' && (
              <>
                {links.length === 0 ? (
                  <SubViewEmptyState
                    icon={<Link2 className="h-5 w-5" />}
                    message="No links shared yet"
                  />
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-white/10">
                    {links.map((link, i) => {
                      let host = link.url
                      try {
                        host = new URL(link.url).hostname
                      } catch {
                        // keep raw url if it isn't parseable
                      }
                      return (
                        <a
                          key={`${link.messageId}-${i}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-500 dark:bg-sky-500/10">
                            <Link2 className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-primary">
                              {host}
                            </p>
                            <p className="truncate text-xs text-secondary">
                              {link.text}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-secondary">
                            {formatRelativeTime(link.createdAt)}
                          </span>
                        </a>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <ConfirmDialog
            open={confirmTarget !== null}
            onOpenChange={(open) => {
              if (!open) setConfirmTarget(null)
            }}
            title={
              confirmTarget?.type === 'remove'
                ? `Remove ${confirmTarget.userName}?`
                : 'Leave this group?'
            }
            description={
              confirmTarget?.type === 'remove'
                ? `${confirmTarget.userName} will be removed from this group and lose access to its messages.`
                : "You'll stop receiving messages from this group unless someone adds you back."
            }
            confirmLabel={confirmTarget?.type === 'remove' ? 'Remove' : 'Leave'}
            isConfirming={
              confirmTarget?.type === 'remove'
                ? removingParticipantId === confirmTarget.userId
                : isLeavingGroup
            }
            onConfirm={() => {
              if (confirmTarget?.type === 'remove') {
                onRemoveParticipant?.(confirmTarget.userId)
              } else if (confirmTarget?.type === 'leave') {
                onLeaveGroup?.()
              }
            }}
          />

          <Dialog open={isEmojiModalOpen} onOpenChange={setIsEmojiModalOpen}>
            <DialogContent className="flex items-center md:max-w-sm">
              <DialogHeader>
                <DialogTitle>Change quick emoji</DialogTitle>
              </DialogHeader>
              <EmojiPickerGrid
                onEmojiSelect={(emoji) => {
                  onSetQuickEmoji?.(emoji)
                  setIsEmojiModalOpen(false)
                }}
              />
              {quickEmoji && (
                <button
                  type="button"
                  onClick={() => {
                    onSetQuickEmoji?.(undefined)
                    setIsEmojiModalOpen(false)
                  }}
                  className="text-sm text-secondary hover:text-gray-700 hover:underline dark:hover:text-white"
                >
                  Reset to default
                </button>
              )}
            </DialogContent>
          </Dialog>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

export { ChatDetailsPanel }
