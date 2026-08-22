import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Search, ShieldCheck, Users, Zap } from 'lucide-react'

interface InsideItem {
  label: string
  icon: LucideIcon
  title: string
  description: string
  bar: string
}

const ITEMS: InsideItem[] = [
  {
    label: '01',
    icon: Zap,
    title: 'Real-time',
    description: 'Messages land the instant they’re sent — no polling, no refresh.',
    bar: 'bg-amber-400',
  },
  {
    label: '02',
    icon: Users,
    title: 'Groups',
    description: 'Create groups, manage admins — your crew, your rules.',
    bar: 'bg-rose-400',
  },
  {
    label: '03',
    icon: Search,
    title: 'Search',
    description: 'Find anyone by name and jump in — no friend requests.',
    bar: 'bg-sky-400',
  },
  {
    label: '04',
    icon: ShieldCheck,
    title: 'Sessions',
    description: 'Sign in once with your phone — come back anytime.',
    bar: 'bg-emerald-400',
  },
]

/**
 * A second, tighter pass at the same feature set FeaturesSection covers
 * in full further up the app — kept to four real capabilities rather
 * than the reference layout's Reactions/Dark Mode/Media, none of which
 * this API supports.
 */
const WhatsInsideSection = () => (
  <section
    id="features"
    className="relative scroll-mt-16 overflow-hidden bg-[#0b0b12] py-24 text-white"
  >
    <div className="mx-auto max-w-6xl px-6">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
        What&apos;s inside
      </p>

      <div
        data-reveal-stagger
        className="mt-10 grid grid-cols-1 divide-y divide-white/10 rounded-2xl border border-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4"
      >
        {ITEMS.map((item) => (
          <div key={item.title} data-reveal-item className="group relative p-8">
            <span className="text-xs font-bold text-white/25">{item.label}</span>
            <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 transition-transform duration-300 group-hover:-translate-y-1">
              <item.icon className="h-5 w-5 text-white/80" />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              {item.description}
            </p>
            <span className={`mt-5 block h-0.5 w-8 rounded-full ${item.bar}`} />
          </div>
        ))}
      </div>
    </div>
  </section>
)

export { WhatsInsideSection }
