import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  CheckCircle2,
  CircleDashed,
  Globe2,
  Heart,
  HeartHandshake,
  Landmark,
  Link2,
  Lock,
  Megaphone,
  MessageSquare,
  Mountain,
  Palmtree,
  Plane,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarqueeItem {
  label: string
  icon: LucideIcon
  tone?: string
}

const CONNECTION_TAGS: MarqueeItem[] = [
  { label: 'Connect', icon: Link2, tone: 'text-violet-300' },
  { label: 'Reach Out', icon: Megaphone, tone: 'text-emerald-300' },
  { label: 'Share', icon: Heart, tone: 'text-amber-300' },
  { label: 'Everywhere', icon: Globe2, tone: 'text-sky-300' },
  { label: 'Instant', icon: Zap, tone: 'text-indigo-300' },
  { label: 'Private', icon: Lock, tone: 'text-sky-300' },
  { label: 'Message', icon: MessageSquare, tone: 'text-white' },
  { label: 'Care', icon: HeartHandshake, tone: 'text-orange-300' },
  { label: 'Borderless', icon: CircleDashed, tone: 'text-teal-300' },
]

const CITIES: MarqueeItem[] = [
  { label: 'Seoul', icon: Plane },
  { label: 'Cairo', icon: Landmark },
  { label: 'Denver', icon: Mountain },
  { label: 'Bali', icon: Palmtree },
  { label: 'Sydney', icon: Building2 },
  { label: 'Tokyo', icon: Globe2 },
  { label: 'Mumbai', icon: Globe2 },
  { label: 'São Paulo', icon: Globe2 },
  { label: 'Lagos', icon: Building2 },
  { label: 'London', icon: Globe2 },
]

const STATS = [
  {
    value: 12400,
    suffix: '+',
    label: 'people connected',
    trend: 'growing daily',
    icon: Users,
    tone: 'text-violet-300',
    badge: 'bg-violet-500/15',
    bar: 'from-violet-500 to-violet-300',
  },
  {
    value: 150,
    suffix: '',
    label: 'countries reached',
    trend: 'no borders',
    icon: ShieldCheck,
    tone: 'text-rose-300',
    badge: 'bg-rose-500/15',
    bar: 'from-rose-500 to-rose-300',
  },
  {
    value: 40,
    suffix: 'ms',
    label: 'average delivery',
    trend: 'feels instant',
    icon: Zap,
    tone: 'text-emerald-300',
    badge: 'bg-emerald-500/15',
    bar: 'from-emerald-500 to-emerald-300',
  },
  {
    value: 99,
    suffix: '.9%',
    label: 'uptime guaranteed',
    trend: 'always on',
    icon: CheckCircle2,
    tone: 'text-amber-300',
    badge: 'bg-amber-500/15',
    bar: 'from-amber-500 to-amber-300',
  },
]

function MarqueeRow({
  items,
  direction,
}: {
  items: MarqueeItem[]
  direction: 'left' | 'right'
}) {
  const loop = [...items, ...items]
  return (
    <div
      data-marquee-row
      className="group relative overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage:
          'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <div
        className={`flex w-max items-center gap-3 group-hover:[animation-play-state:paused] ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        }`}
      >
        {loop.map((item, index) => (
          <span
            key={`${item.label}-${index}`}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm"
          >
            <item.icon className={`h-3.5 w-3.5 ${item.tone ?? 'text-white/50'}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

const ConnectMarqueeSection = () => (
  <section className="relative overflow-hidden bg-[#080809] pb-0 pt-6 text-white">
    <div className="flex flex-col gap-4">
      <MarqueeRow items={CONNECTION_TAGS} direction="left" />
      <MarqueeRow items={CITIES} direction="right" />
    </div>

    <div className="mx-auto mt-16 max-w-6xl px-6">
      <p
        data-reveal
        className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/40"
      >
        <span className="h-px w-8 bg-white/30" />
        The numbers
      </p>

      <div
        data-reveal-stagger
        className="mt-6 grid grid-cols-2 divide-x divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] sm:grid-cols-4 sm:divide-y-0"
      >
        {STATS.map((stat) => (
          <div
            key={stat.label}
            data-reveal-item
            className="group relative overflow-hidden p-6 transition-colors duration-300 hover:bg-white/[0.04]"
          >
            <stat.icon
              className="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 text-white/[0.04] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
              strokeWidth={1}
            />

            <div
              className={cn(
                'relative flex h-11 w-11 items-center justify-center rounded-full',
                stat.badge
              )}
            >
              <stat.icon className={`h-5 w-5 ${stat.tone}`} />
            </div>

            <p className="relative mt-4 font-display text-3xl font-extrabold sm:text-4xl">
              <span data-counter={stat.value}>0</span>
              {stat.suffix}
            </p>
            <p className="relative mt-1.5 text-sm text-white/50">{stat.label}</p>

            <p className="relative mt-3 flex items-center gap-1 text-[11px] font-medium text-white/30">
              <TrendingUp className="h-3 w-3" />
              {stat.trend}
            </p>

            <span
              className={cn(
                'absolute inset-x-0 bottom-0 h-1 rounded-full bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                stat.bar
              )}
            />
          </div>
        ))}
      </div>
    </div>
  </section>
)

export { ConnectMarqueeSection }
