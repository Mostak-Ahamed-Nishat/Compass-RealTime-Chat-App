import * as React from 'react'
import gsap from 'gsap'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'

interface Testimonial {
  quote: string
  name: string
  route: string
  avatar: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Real-time delivery matters for business. My conversations stay instant, always.',
    name: 'Priya N.',
    route: 'Mumbai → Dubai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&auto=format',
  },
  {
    quote: "No more refreshing to see if someone replied. It's just... there.",
    name: 'Chen W.',
    route: 'Shanghai → Vancouver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format',
  },
  {
    quote: 'I talk to my family in Lagos every day now. It feels like they’re right here.',
    name: 'Amara K.',
    route: 'London → Lagos',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&auto=format',
  },
  {
    quote: 'Instant delivery across time zones. Our remote team has never been closer.',
    name: 'Riku T.',
    route: 'Tokyo → San Francisco',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&auto=format',
  },
  {
    quote: 'Even my 75-year-old grandma uses it. She never misses a message now.',
    name: 'Sofia M.',
    route: 'São Paulo → Berlin',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&auto=format',
  },
  {
    quote: '40ms delivery is no joke. It feels faster than being in the same room.',
    name: 'James O.',
    route: 'New York → Sydney',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&auto=format',
  },
  {
    quote: "Group chats made planning my sister's wedding so much easier.",
    name: 'Noor A.',
    route: 'Cairo → Toronto',
    avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=100&h=100&fit=crop&auto=format',
  },
  {
    quote: 'Signing in with just my phone number took fifteen seconds. That was it.',
    name: 'Diego R.',
    route: 'Madrid → Austin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&auto=format',
  },
]

/**
 * Auto-scrolling infinite marquee — cards continuously scroll left
 * without bouncing back on scroll direction changes.
 */
function useAutoScrollMarquee(trackRef: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    if (!trackRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const track = trackRef.current
    const ctx = gsap.context(() => {
      const distance = track.scrollWidth / 2
      gsap.to(track, {
        x: -distance,
        duration: 30,
        ease: 'none',
        repeat: -1,
      })
    })

    return () => ctx.revert()
  }, [trackRef])
}

const TestimonialsSection = () => {
  const trackRef = React.useRef<HTMLDivElement>(null)
  useAutoScrollMarquee(trackRef)

  return (
    <section
      id="social-proof"
      className="relative scroll-mt-16 overflow-hidden bg-[#0b0b12] py-24 text-white"
    >
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
          What people say
        </p>
        <h2 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] sm:text-5xl">
          Real people.
          <br />
          <span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.25)]">
            Real connections.
          </span>
        </h2>
      </div>

      <div
        className="relative mt-12 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage:
            'linear-gradient(90deg, transparent, black 5%, black 95%, transparent)',
        }}
      >
        <div ref={trackRef} className="flex w-max gap-5">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((item, index) => (
            <figure
              key={`${item.name}-${index}`}
              className="w-72 shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <span className="block h-px w-6 bg-white/20" />
              <blockquote className="mt-4 text-sm leading-relaxed text-white/70">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={item.avatar} alt={item.name} />
                  <AvatarFallback>{item.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-white/80">{item.name}</p>
                  <p className="text-[11px] text-white/40">{item.route}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
        <div className="flex -space-x-3">
          {TESTIMONIALS.map((item) => (
            <Avatar key={item.name} className="h-9 w-9 border-2 border-[#0b0b12]">
              <AvatarImage src={item.avatar} alt={item.name} />
              <AvatarFallback>{item.name[0]}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <p className="font-display text-lg font-bold">
          12,400+ people already connected.
        </p>
        <p className="text-sm text-white/40">
          Across 150 countries. Typed in 40+ languages. Every moment, shared.
        </p>
      </div>
    </section>
  )
}

export { TestimonialsSection }
