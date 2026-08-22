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
  Pin,
  Search,
  Shield,
  Smile,
  Type,
  User,
  UserMinus,
  X,
} from 'lucide-react'
import { IconButton, EmojiPickerComponent } from '@/components/ui'
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
  className?: string
}

type SubView = 'root' | 'profile' | 'pinned' | 'media' | 'files' | 'links'
type CustomizeField = 'theme' | 'emoji' | 'nickname' | null

const SUBVIEW_TITLES: Record<Exclude<SubView, 'root'>, string> = {
  profile: 'Profile',
  pinned: 'Pinned messages',
  media: 'Media',
  files: 'Files',
  links: 'Links',
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-100 px-1.5 text-xs font-medium text-secondary">
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
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
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
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  meta?: React.ReactNode
  onClick?: () => void
  expanded?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          iconBg
        )}
      >
        {icon}
      </span>
      <span className="flex-1 truncate text-sm text-gray-900">{label}</span>
      {meta}
      <ChevronRight
        className={cn(
          'h-4 w-4 shrink-0 text-gray-300 transition-transform',
          expanded && 'rotate-90'
        )}
      />
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
            : 'border-gray-200 text-secondary hover:bg-gray-50'
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
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
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
  className,
}: ChatDetailsPanelProps) => {
  const shouldReduceMotion = useReducedMotion()
  const offset = shouldReduceMotion ? 0 : 24

  const [view, setView] = React.useState<SubView>('root')
  const [isSearching, setIsSearching] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [customizeField, setCustomizeField] = React.useState<CustomizeField>(null)
  const [nicknameDraft, setNicknameDraft] = React.useState(nickname ?? '')

  React.useEffect(() => {
    if (!isOpen) {
      setView('root')
      setIsSearching(false)
      setSearchQuery('')
      setCustomizeField(null)
    }
  }, [isOpen])

  React.useEffect(() => {
    setView('root')
    setIsSearching(false)
    setSearchQuery('')
    setCustomizeField(null)
  }, [conversation._id])

  React.useEffect(() => {
    setNicknameDraft(nickname ?? '')
  }, [nickname])

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

  const headerTitle = view === 'root' ? 'Chat Details' : SUBVIEW_TITLES[view]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ opacity: 0, x: offset }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: offset }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'fixed inset-0 z-40 flex h-full w-full flex-col bg-white md:static md:z-auto md:h-full md:w-[320px] md:shrink-0 md:border-l md:border-gray-200',
            className
          )}
        >
          <div className="flex h-[73px] shrink-0 items-center justify-between border-b border-gray-200 px-4">
            <div className="flex min-w-0 items-center gap-1">
              {view !== 'root' && (
                <IconButton
                  icon={<ChevronLeft className="h-5 w-5" />}
                  label="Back"
                  onClick={() => setView('root')}
                />
              )}
              <span className="truncate text-sm font-semibold text-gray-900">
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
            {view === 'root' && (
              <>
                <div className="flex flex-col items-center gap-1 px-4 pb-5 pt-6 text-center">
                  <ConversationAvatar
                    name={displayName}
                    size="lg"
                    className="h-20 w-20 text-xl"
                  />
                  <p className="mt-3 text-base font-semibold text-gray-900">
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
                    icon={<Search className="h-5 w-5" />}
                    label="Search"
                    active={isSearching}
                    onClick={() => setIsSearching((s) => !s)}
                  />
                </div>

                {isSearching ? (
                  <div className="flex flex-1 flex-col border-t border-gray-100">
                    <div className="px-4 py-3">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          autoFocus
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search in this chat"
                          className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                            className="rounded-xl px-2 py-2.5 hover:bg-gray-50"
                          >
                            <p className="line-clamp-2 text-sm text-gray-900">
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
                        iconBg="bg-rose-50 text-rose-500"
                        label="View pinned messages"
                        meta={<Badge>0</Badge>}
                        onClick={() => setView('pinned')}
                      />
                    </Section>

                    <Section title="Customize chat">
                      <div>
                        <Row
                          icon={<div className="h-4 w-4 rounded-full bg-current" />}
                          iconBg="bg-blue-50 text-blue-500"
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
                                    'flex h-7 w-7 items-center justify-center rounded-full ring-offset-2 transition-shadow',
                                    isSelected && 'ring-2 ring-gray-900'
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
                          iconBg="bg-amber-50 text-amber-500"
                          label="Change emoji"
                          meta={<span className="text-base">{quickEmoji ?? '👍'}</span>}
                          expanded={customizeField === 'emoji'}
                          onClick={() =>
                            setCustomizeField((f) =>
                              f === 'emoji' ? null : 'emoji'
                            )
                          }
                        />
                        {customizeField === 'emoji' && (
                          <div className="flex items-center gap-3 py-1 pb-3 pl-16 pr-4">
                            <EmojiPickerComponent
                              onEmojiSelect={(emoji) => onSetQuickEmoji?.(emoji)}
                              size="sm"
                            />
                            {quickEmoji && (
                              <button
                                type="button"
                                onClick={() => onSetQuickEmoji?.(undefined)}
                                className="text-xs text-secondary hover:text-gray-700 hover:underline"
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
                          iconBg="bg-violet-50 text-violet-500"
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
                              className="h-9 flex-1 rounded-full border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                        iconBg="bg-emerald-50 text-emerald-500"
                        label="Media"
                        meta={<Badge>0</Badge>}
                        onClick={() => setView('media')}
                      />
                      <Row
                        icon={<FileText className="h-4 w-4" />}
                        iconBg="bg-orange-50 text-orange-500"
                        label="Files"
                        meta={<Badge>0</Badge>}
                        onClick={() => setView('files')}
                      />
                      <Row
                        icon={<Link2 className="h-4 w-4" />}
                        iconBg="bg-sky-50 text-sky-500"
                        label="Links"
                        meta={<Badge>{links.length}</Badge>}
                        onClick={() => setView('links')}
                      />
                    </Section>
                  </>
                )}
              </>
            )}

            {view === 'profile' && (
              <div className="flex flex-1 flex-col">
                <div className="flex flex-col items-center gap-1 px-4 pb-6 pt-8 text-center">
                  <ConversationAvatar
                    name={displayName}
                    size="lg"
                    className="h-24 w-24 text-2xl"
                  />
                  <p className="mt-3 text-lg font-semibold text-gray-900">
                    {displayName}
                  </p>
                  <p className="text-sm text-secondary">{handle}</p>
                </div>

                {conversation.type === 'direct' ? (
                  <div className="space-y-3 border-t border-gray-100 px-4 py-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                        Phone
                      </p>
                      <p className="mt-0.5 text-sm text-gray-900">
                        {conversation.participant.phone}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-100 px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                      {conversation.participants.length} members
                    </p>
                    <div className="mt-2 space-y-1">
                      {conversation.participants.map((p) => {
                        const isSelf = p._id === currentUserId
                        const isCurrentUserAdmin =
                          conversation.admins.includes(currentUserId)
                        const isRemoving = removingParticipantId === p._id
                        return (
                          <div
                            key={p._id}
                            className="flex items-center gap-3 rounded-xl px-1 py-2"
                          >
                            <ConversationAvatar name={p.name} size="sm" />
                            <span className="flex-1 truncate text-sm text-gray-900">
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
                                onClick={() => onRemoveParticipant?.(p._id)}
                                className="text-red-500 hover:bg-red-50"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={onLeaveGroup}
                      disabled={isLeavingGroup}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <LogOut className="h-4 w-4" />
                      {isLeavingGroup ? 'Leaving…' : 'Leave group'}
                    </button>
                  </div>
                )}
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
                  <div className="divide-y divide-gray-100">
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
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-500">
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
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

export { ChatDetailsPanel }
