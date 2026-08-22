import * as React from 'react'
import { CommunityAvatars } from '@/components/auth/community-avatars'

const STATS = [
  { value: 650000, suffix: '+', label: 'Active users' },
  { value: 12000000, suffix: '+', label: 'Messages delivered' },
  { value: 99, suffix: '.9%', label: 'Real-time uptime' },
]

const SocialProofSection = () => (
  <section className="bg-gray-50/60 py-24">
    <div className="mx-auto max-w-6xl px-6">
      <div data-reveal className="flex flex-col items-center gap-3 text-center">
        <CommunityAvatars headline="" subtext="" />
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Trusted by people who message a lot.
        </h2>
      </div>

      <div
        data-reveal-stagger
        className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3"
      >
        {STATS.map((stat) => (
          <div
            key={stat.label}
            data-reveal-item
            className="rounded-xl border border-gray-100 bg-white px-6 py-8 text-center shadow-sm"
          >
            <p className="font-display text-4xl font-extrabold text-primary">
              <span data-counter={stat.value}>0</span>
              {stat.suffix}
            </p>
            <p className="mt-2 text-sm font-medium text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export { SocialProofSection }
