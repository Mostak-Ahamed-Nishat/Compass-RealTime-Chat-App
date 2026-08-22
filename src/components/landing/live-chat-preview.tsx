import * as React from 'react'
import { Send, Sparkles } from 'lucide-react'
import { MessageBubble, TypingIndicator, ConversationAvatar } from '@/components/chat'
import { IconButton } from '@/components/ui'
import type { Message } from '@/types'

const ME_ID = 'you'
const PERSONA = { id: 'amara', name: 'Amara' }

const SCRIPT: Array<{ from: 'them' | 'you'; text: string }> = [
  { from: 'them', text: 'Hey! Just tried the new group chat 🎉' },
  { from: 'you', text: 'Right? Feels instant — no refreshing at all' },
  { from: 'them', text: "That's Socket.io doing its job 👀" },
  { from: 'you', text: 'Exactly why we built it this way' },
]

const REPLIES = [
  "That's the real message bubble component you're looking at — not a screenshot.",
  'Try a longer message — it wraps exactly like it does in the real app.',
  'This little sandbox is just for fun. The real app only needs your phone number 😉',
  'Go ahead, say something else — I\'ll keep replying.',
]

let scriptCounter = 0
let liveCounter = 0

function scriptedMessage(entry: { from: 'them' | 'you'; text: string }): Message {
  scriptCounter += 1
  return {
    _id: `script-${scriptCounter}`,
    conversation: 'demo',
    sender: entry.from === 'you' ? ME_ID : PERSONA.id,
    text: entry.text,
    createdAt: new Date().toISOString(),
  }
}

function liveMessage(sender: string, text: string): Message {
  liveCounter += 1
  return {
    _id: `live-${liveCounter}`,
    conversation: 'demo',
    sender,
    text,
    createdAt: new Date().toISOString(),
  }
}

const LiveChatPreview = () => {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [typingFrom, setTypingFrom] = React.useState<'them' | null>(null)
  const [isInteractive, setIsInteractive] = React.useState(false)
  const [draft, setDraft] = React.useState('')
  const replyIndexRef = React.useRef(0)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Ambient autoplay loop until the visitor sends their own message.
  React.useEffect(() => {
    if (isInteractive) return
    if (typeof window === 'undefined') return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMessages(SCRIPT.map(scriptedMessage))
      return
    }

    let cancelled = false
    let index = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []
    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(() => {
        if (!cancelled) fn()
      }, delay)
      timeouts.push(id)
    }

    const step = () => {
      if (index >= SCRIPT.length) {
        schedule(() => {
          setMessages([])
          index = 0
          step()
        }, 2400)
        return
      }
      const entry = SCRIPT[index]
      if (entry.from === 'them') {
        setTypingFrom('them')
        schedule(() => {
          setTypingFrom(null)
          setMessages((prev) => [...prev, scriptedMessage(entry)])
          index += 1
          schedule(step, 900)
        }, 1100)
      } else {
        schedule(() => {
          setMessages((prev) => [...prev, scriptedMessage(entry)])
          index += 1
          schedule(step, 900)
        }, 700)
      }
    }

    step()
    return () => {
      cancelled = true
      timeouts.forEach(clearTimeout)
    }
  }, [isInteractive])

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, typingFrom])

  const handleSend = () => {
    const text = draft.trim()
    if (!text) return
    setIsInteractive(true)
    setDraft('')
    setMessages((prev) => [...prev, liveMessage(ME_ID, text)])
    setTypingFrom('them')
    const reply = REPLIES[replyIndexRef.current % REPLIES.length]
    replyIndexRef.current += 1
    setTimeout(() => {
      setTypingFrom(null)
      setMessages((prev) => [...prev, liveMessage(PERSONA.id, reply)])
    }, 1000)
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-2xl" />

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-primary/10">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
          <ConversationAvatar name={PERSONA.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {PERSONA.name}
            </p>
            <p className="text-xs font-medium text-emerald-500">Online now</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
            <Sparkles className="h-3 w-3" />
            Live demo
          </span>
        </div>

        <div
          ref={scrollRef}
          className="no-scrollbar flex h-[360px] flex-col overflow-y-auto bg-gray-50 py-3 sm:h-[400px]"
        >
          {messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={message.sender === ME_ID}
              senderName={message.sender === ME_ID ? undefined : PERSONA.name}
            />
          ))}
          {typingFrom === 'them' && <TypingIndicator name={PERSONA.name} />}
        </div>

        <div className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-2.5">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSend()
              }
            }}
            placeholder="Say hi — this actually works"
            className="h-10 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <IconButton
            icon={<Send className="h-4 w-4" />}
            label="Send message"
            onClick={handleSend}
            disabled={!draft.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-gray-100 disabled:text-gray-300"
          />
        </div>
      </div>
    </div>
  )
}

export { LiveChatPreview }
