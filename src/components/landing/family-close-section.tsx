import * as React from 'react'
import { ArrowRight, Clock, Lock, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAuthCta } from './use-auth-cta'

interface Highlight {
  icon: LucideIcon
  text: string
  tone: string
}

const HIGHLIGHTS: Highlight[] = [
  {
    icon: Clock,
    text: 'Works across every time zone and country',
    tone: 'bg-violet-500/15 text-violet-300',
  },
  {
    icon: Lock,
    text: 'Private by default — only participants see a chat',
    tone: 'bg-emerald-500/15 text-emerald-300',
  },
  {
    icon: Zap,
    text: 'Delivered in under 40ms, anywhere on earth',
    tone: 'bg-amber-500/15 text-amber-300',
  },
]

/**
 * Copy is scoped to what actually exists: message delivery, group chats,
 * and auth-gated conversations. No voice notes, no reactions — the
 * reference layout mentioned both, but this API doesn't support them.
 */
const FamilyCloseSection = () => {
  const { label, go, isLoading, isAuthenticated } = useAuthCta()

  return (
    <section className="relative overflow-hidden bg-[#0b0b12] py-24 text-white">
      <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute -left-6 -top-14 select-none font-display text-[10rem] font-extrabold leading-none text-white/[0.03]"
          >
            &ldquo;
          </span>

          <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            For the ones who matter most
          </p>
          <h2 className="relative mt-4 font-display text-4xl font-extrabold leading-[0.95] sm:text-5xl">
            Your family,
            <br />
            <span className="gradient-text-animate">always close.</span>
          </h2>
          <p className="relative mt-5 max-w-md text-white/60">
            Send a message from the airport. Start a group for grandma&apos;s
            birthday. Catch up across time zones — connection doesn&apos;t
            wait.
          </p>

          <div className="relative mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.text}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.06]"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${item.tone}`}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="text-xs leading-snug text-white/70">
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          <div className="relative mt-9 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              onClick={go}
              isLoading={isLoading}
              className="group bg-white text-base font-semibold text-gray-900 hover:bg-white/90 active:bg-white/80"
            >
              {isAuthenticated ? label : 'Start a group chat'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <span className="text-sm text-white/40">
              Free. Just your phone number.
            </span>
          </div>
        </div>

        <div
          data-reveal-stagger
          className="relative mx-auto h-[420px] w-full max-w-sm sm:h-[460px]"
        >
          <div data-reveal-item className="absolute left-0 top-0 h-[56%] w-[54%]">
            <figure
              className="h-full w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 animate-image-float"
              style={{ animationDelay: '0s' }}
            >
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=520&h=680&fit=crop&auto=format"
                alt="Family together"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </figure>
          </div>

          <div data-reveal-item className="absolute right-0 top-0 h-[38%] w-[48%]">
            <figure
              className="h-full w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 animate-image-float"
              style={{ animationDelay: '0.6s' }}
            >
              <img
                src="https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=520&h=420&fit=crop&auto=format"
                alt="Friends laughing together"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </figure>
          </div>

          <div data-reveal-item className="absolute bottom-0 left-0 h-[38%] w-[44%]">
            <figure
              className="h-full w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 animate-image-float"
              style={{ animationDelay: '1.2s' }}
            >
              <img
                src="https://images.unsplash.com/photo-1758874960091-3902ffed7305?w=480&h=380&fit=crop&auto=format"
                alt="Grandmother smiling in a video call"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </figure>
          </div>

          <div data-reveal-item className="absolute bottom-0 right-0 h-[46%] w-[50%]">
            <figure
              className="h-full w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 animate-image-float"
              style={{ animationDelay: '0.3s' }}
            >
              <img
                src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=520&h=460&fit=crop&auto=format"
                alt="Group of friends together"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </figure>
          </div>

          <div
            data-reveal-item
            className="absolute right-[2%] top-[40%] z-20 flex items-center gap-2 rounded-xl border border-white/10 bg-[#15151d] px-3 py-2 shadow-xl"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-xs">
              💬
            </span>
            <div>
              <p className="text-[11px] font-semibold text-white/80">Mom replied</p>
              <p className="text-[10px] text-white/40">just now</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FamilyCloseSection }
