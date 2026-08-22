import * as React from 'react'
import { Image as ImageIcon, Mic, Smile, Zap } from 'lucide-react'
import { Logo } from '@/components/ui'
import { FeatureCard } from './feature-card'

const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1200&h=900&fit=crop&auto=format'

const FEATURES = [
  { icon: Zap, title: 'Real-time', subtitle: 'Instant message delivery', accent: true },
  { icon: Mic, title: 'Voice notes', subtitle: 'Talk naturally' },
  { icon: ImageIcon, title: 'Share moments', subtitle: 'Photos & videos' },
  { icon: Smile, title: 'Reactions', subtitle: 'Express feelings' },
]

/**
 * Reusable hero-image treatment: cover photo + brand gradient wash.
 * Reuse this overlay recipe (`bg-gradient-to-br from-violet-600/70
 * via-indigo-900/75 to-black/90` + a bottom darkening pass) anywhere
 * else a photo needs to host light text — e.g. the Part 2 landing page.
 */
const LoginHero = () => (
  <div className="relative hidden overflow-hidden md:block md:min-h-screen md:w-1/2 lg:w-[55%]">
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url('${HERO_IMAGE_URL}')` }}
    />
    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/70 via-purple-900/75 to-black/90" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

    <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
      <Logo variant="light" />

      <div>
        <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          Stay close
          <br />
          <span className="text-accent">to who</span> matters.
        </h1>
        <p className="mt-4 max-w-md text-white/70">
          Real-time chats, voice notes, and shared moments — all in one
          beautiful space.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  </div>
)

export { LoginHero }
