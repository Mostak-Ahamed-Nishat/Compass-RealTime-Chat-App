import * as React from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Phone, Search, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MessageBubble, TypingIndicator, ConversationAvatar } from '@/components/chat'
import type { Message } from '@/types'

interface OnboardStep {
  label: string
  title: string
  tagline: string
  description: string
  tags: string[]
  tagTone: string
  Preview: React.ComponentType
}

// Fixed timestamps, not `new Date()` — this is static demo content, and a
// live timestamp would be computed once at server render and again at
// client hydration, producing different formatted text and a hydration
// mismatch (the exact "Server: 12:53 AM, Client: 0:53" class of bug).
const PREVIEW_MESSAGES: Message[] = [
  {
    _id: 'p1',
    conversation: 'preview',
    sender: 'amara',
    text: "You free to talk? I'm on the other side of the world right now 🌍",
    createdAt: '2024-01-01T12:53:00.000Z',
  },
  {
    _id: 'p2',
    conversation: 'preview',
    sender: 'you',
    text: "Always. What's up?",
    createdAt: '2024-01-01T12:54:00.000Z',
  },
]

const SignInPreview = () => (
  <div className="flex h-full flex-col justify-center gap-3 p-6">
    <p className="text-xs font-semibold uppercase tracking-wide text-white/30">
      Compass · sign in
    </p>
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      <Phone className="h-4 w-4 text-white/40" />
      <span className="text-sm text-white/70">+1 415 555 0192</span>
    </div>
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      <span className="text-sm text-white/70">Alex</span>
    </div>
    <div className="mt-1 rounded-xl bg-gradient-to-r from-primary to-violet-400 px-3 py-2.5 text-center text-sm font-semibold text-white">
      Continue
    </div>
  </div>
)

const SearchPreview = () => (
  <div className="flex h-full flex-col gap-3 p-6">
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      <Search className="h-4 w-4 text-white/40" />
      <span className="text-sm text-white/40">Search by name…</span>
    </div>
    {[
      { name: 'Amara K.', sub: 'Lagos' },
      { name: 'Riku T.', sub: 'Tokyo' },
    ].map((person) => (
      <div
        key={person.name}
        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
      >
        <div className="flex items-center gap-2.5">
          <ConversationAvatar name={person.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-white/80">{person.name}</p>
            <p className="text-xs text-white/30">{person.sub}</p>
          </div>
        </div>
        <span className="rounded-full bg-rose-400/15 px-2.5 py-1 text-[11px] font-semibold text-rose-200">
          Message
        </span>
      </div>
    ))}
  </div>
)

// Real MessageBubble timestamps go through `toLocaleTimeString`, which
// formats using the runtime's locale/timezone — the server (Node) and the
// browser rarely agree, so any timestamp rendered during SSR here would
// hydrate to different text. The real chat page never hits this because
// messages only ever exist client-side (fetched after mount); this
// decorative preview has to opt into the same rule explicitly.
const TalkPreview = () => {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-3">
        <ConversationAvatar name="Amara" size="sm" isOnline />
        <div>
          <p className="text-sm font-semibold text-white/80">Amara</p>
          <p className="text-[11px] text-emerald-300">Online now</p>
        </div>
      </div>
      <div className="flex-1 py-2">
        {mounted &&
          PREVIEW_MESSAGES.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={message.sender === 'you'}
              senderName={message.sender === 'you' ? undefined : 'Amara'}
            />
          ))}
        {mounted && <TypingIndicator name="Amara" />}
      </div>
      <div className="flex items-center gap-2 border-t border-white/10 px-3 py-2.5">
        <div className="h-8 flex-1 rounded-full bg-white/5" />
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Send className="h-3.5 w-3.5 text-white" />
        </span>
      </div>
    </div>
  )
}

const STEPS: OnboardStep[] = [
  {
    label: '01',
    title: 'Sign in, instantly',
    tagline: '15 seconds flat.',
    description:
      "No password to remember. Your phone number and name — that's the whole signup.",
    tags: ['Phone-based', 'No password', 'Private by default'],
    tagTone: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
    Preview: SignInPreview,
  },
  {
    label: '02',
    title: 'Find your people',
    tagline: 'No requests, no waiting.',
    description:
      'Search by name and jump straight into a conversation — no friend requests to approve.',
    tags: ['Search by name', 'No friend requests', 'Instant results'],
    tagTone: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
    Preview: SearchPreview,
  },
  {
    label: '03',
    title: 'Talk. Share. Be there.',
    tagline: 'Real-time, everywhere.',
    description:
      'Messages, typing indicators, and read receipts sync live — powered by Socket.io.',
    tags: ['Real-time delivery', 'Typing indicators', 'Instant sync'],
    tagTone: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    Preview: TalkPreview,
  },
]

/**
 * Scroll-stack: each step is a sticky card. As the next card scrolls up
 * to take its place, the current one scales down and dims slightly
 * (GSAP scrub tied to the next card's own entrance), so the deck reads
 * as physically stacking rather than just replacing itself.
 */
const OnboardingCarouselSection = () => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const cardRefs = React.useRef<Array<HTMLDivElement | null>>([])

  React.useEffect(() => {
    if (!containerRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card, index) => {
        const nextCard = cardRefs.current[index + 1]
        if (!card || !nextCard) return

        gsap.to(card, {
          scale: 0.94,
          opacity: 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: nextCard,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-16 bg-[#0b0b12] py-24 text-white"
    >
      <div className="mx-auto max-w-5xl px-6">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          <span className="h-px w-8 bg-white/30" />
          Getting started
        </p>
        <h2 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] sm:text-5xl">
          Up &amp; running
          <br />
          <span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.25)]">
            in 15 seconds.
          </span>
        </h2>
      </div>

      <div ref={containerRef} className="mx-auto mt-16 max-w-5xl px-6">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className="sticky pb-32"
            style={{ top: `${88 + index * 16}px`, zIndex: index + 1 }}
          >
            <div
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              className="origin-top overflow-hidden rounded-3xl border border-white/10 bg-[#111118] shadow-2xl shadow-black/50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 md:p-10">
                  <span
                    className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold',
                      'border-white/15 bg-white/5 text-white/50'
                    )}
                  >
                    {step.label}
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm italic text-white/40">{step.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {step.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[11px] font-medium',
                          step.tagTone
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="h-72 border-t border-white/10 bg-[#0d0d14] md:h-auto md:border-l md:border-t-0">
                  <step.Preview />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export { OnboardingCarouselSection }
