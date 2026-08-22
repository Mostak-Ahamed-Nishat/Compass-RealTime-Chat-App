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
  Users,
  Zap,
} from 'lucide-react'

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
  { value: 12400, suffix: '+', label: 'people connected', icon: Users, tone: 'text-violet-400', bar: 'bg-violet-500' },
  { value: 150, suffix: '', label: 'countries reached', icon: ShieldCheck, tone: 'text-rose-400', bar: 'bg-rose-500' },
  { value: 40, suffix: 'ms', label: 'average delivery', icon: Zap, tone: 'text-emerald-400', bar: 'bg-emerald-500' },
  { value: 99, suffix: '.9%', label: 'uptime guaranteed', icon: CheckCircle2, tone: 'text-amber-400', bar: 'bg-amber-500' },
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
    <div className="relative overflow-hidden">
      <div
        className={`flex w-max items-center gap-3 ${
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
  <section className="relative overflow-hidden bg-[#080809] pb-20 pt-6 text-white">
    <div className="flex flex-col gap-4">
      <MarqueeRow items={CONNECTION_TAGS} direction="left" />
      <MarqueeRow items={CITIES} direction="right" />
    </div>

    <div
      data-reveal-stagger
      className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-4 px-6 sm:grid-cols-4"
    >
      {STATS.map((stat) => (
        <div
          key={stat.label}
          data-reveal-item
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          <stat.icon className={`h-5 w-5 ${stat.tone}`} />
          <p className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            <span data-counter={stat.value}>0</span>
            {stat.suffix}
          </p>
          <p className="mt-2 text-sm text-white/50">{stat.label}</p>
          <span className={`absolute inset-x-0 bottom-0 h-1 ${stat.bar}`} />
        </div>
      ))}
    </div>
  </section>
)

export { ConnectMarqueeSection }
