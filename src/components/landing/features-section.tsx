import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { CheckCheck, RefreshCw, Search, ShieldCheck, Users, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  accent?: boolean
}

const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: 'Real-time delivery',
    description:
      'Messages land the instant they’re sent via Socket.io — no polling, no page refresh.',
    accent: true,
  },
  {
    icon: Users,
    title: 'Direct & group chats',
    description:
      'Start a one-on-one conversation or spin up a group with a few people in seconds.',
  },
  {
    icon: Search,
    title: 'Instant people search',
    description:
      'Find anyone by name and jump straight into a conversation — no friend requests.',
  },
  {
    icon: CheckCheck,
    title: 'Typing & live status',
    description:
      'See when someone’s replying and watch conversations reorder themselves live.',
  },
  {
    icon: RefreshCw,
    title: 'Optimistic sending',
    description:
      'Your message appears instantly. If it fails to send, retry with a single tap.',
  },
  {
    icon: ShieldCheck,
    title: 'Session that sticks',
    description:
      'Sign in once with your phone number — come back later and you’re still in.',
  },
]

const FeatureCardTile = ({ icon: Icon, title, description, accent }: Feature) => (
  <div
    data-reveal-item
    className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
  >
    <div
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-xl',
        accent ? 'bg-accent/20 text-accent-foreground' : 'bg-primary/10 text-primary'
      )}
    >
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="mt-4 font-display text-lg font-bold text-gray-900">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-secondary">{description}</p>
  </div>
)

const FeaturesSection = () => (
  <section id="features" className="bg-gray-50/60 py-24">
    <div className="mx-auto max-w-6xl px-6">
      <div data-reveal className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Built for the chat panel
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Everything a real chat product needs — nothing it doesn’t.
        </h2>
      </div>

      <div
        data-reveal-stagger
        className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((feature) => (
          <FeatureCardTile key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  </section>
)

export { FeaturesSection }
