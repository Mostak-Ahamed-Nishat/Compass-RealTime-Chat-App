import * as React from 'react'
import gsap from 'gsap'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAuthCta } from './use-auth-cta'

interface FloatCard {
  src: string
  alt: string
  className: string
}

const FLOAT_CARDS: FloatCard[] = [
  {
    src: 'https://images.unsplash.com/photo-1758273706082-392462e9c184?w=640&h=440&fit=crop&auto=format',
    alt: 'Woman video calling family on her phone',
    className: 'right-0 top-0 w-[62%] sm:w-[300px]',
  },
  {
    src: 'https://images.unsplash.com/photo-1758525226768-2d1b900ba2c0?w=560&h=400&fit=crop&auto=format',
    alt: 'Friends sharing a phone screen over coffee',
    className: 'left-0 top-[36%] w-[58%] sm:w-[270px]',
  },
  {
    src: 'https://images.unsplash.com/photo-1758275557473-6e6359ced762?w=620&h=430&fit=crop&auto=format',
    alt: 'Group of friends taking a selfie outdoors',
    className: 'bottom-0 right-[4%] w-[64%] sm:w-[310px]',
  },
]

const NETWORK_DOTS = [
  { cx: 480, cy: 90, r: 3 },
  { cx: 560, cy: 60, r: 2 },
  { cx: 610, cy: 170, r: 4 },
  { cx: 520, cy: 240, r: 2 },
  { cx: 440, cy: 320, r: 3 },
  { cx: 590, cy: 400, r: 2 },
  { cx: 470, cy: 470, r: 5 },
  { cx: 350, cy: 210, r: 2 },
]

const NETWORK_LINES = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 4],
  [4, 7],
  [4, 5],
  [5, 6],
]

const HeroSection = () => {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const spotlightRef = React.useRef<HTMLDivElement>(null)
  const { label, go, isLoading, isAuthenticated } = useAuthCta()
  const ctaLabel = isAuthenticated ? label : 'Start connecting'

  React.useEffect(() => {
    if (!rootRef.current) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches

    if (reducedMotion) return

    const cleanupFns: Array<() => void> = []

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero-eyebrow]', { autoAlpha: 0, y: 12, duration: 0.5 })
        .from(
          '[data-hero-line]',
          { autoAlpha: 0, y: 28, duration: 0.7, stagger: 0.12 },
          '-=0.2'
        )
        .from('[data-hero-copy]', { autoAlpha: 0, y: 16, duration: 0.6 }, '-=0.35')
        .from('[data-hero-cta]', { autoAlpha: 0, y: 16, duration: 0.5 }, '-=0.4')
        .from(
          '[data-hero-card]',
          { autoAlpha: 0, y: 26, scale: 0.94, duration: 0.7, stagger: 0.12 },
          '-=0.5'
        )

      const cards = gsap.utils.toArray<HTMLElement>('[data-hero-card]')

      cards.forEach((card, index) => {
        gsap.to(card, {
          y: '+=14',
          duration: 3.2 + index * 0.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 0.6 + index * 0.3,
        })
      })

      if (hasFinePointer) {
        gsap.set(spotlightRef.current, { opacity: 1 })
        gsap.set(cards, { transformPerspective: 800 })

        const tilts = cards.map((card) => ({
          rotX: gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power3.out' }),
          rotY: gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power3.out' }),
        }))

        cards.forEach((card, index) => {
          const onMove = (event: MouseEvent) => {
            const rect = card.getBoundingClientRect()
            const px = (event.clientX - rect.left) / rect.width - 0.5
            const py = (event.clientY - rect.top) / rect.height - 0.5
            tilts[index].rotY(px * 16)
            tilts[index].rotX(-py * 16)
          }
          const onLeave = () => {
            tilts[index].rotY(0)
            tilts[index].rotX(0)
          }
          card.addEventListener('mousemove', onMove)
          card.addEventListener('mouseleave', onLeave)
          cleanupFns.push(() => {
            card.removeEventListener('mousemove', onMove)
            card.removeEventListener('mouseleave', onLeave)
          })
        })

        const moveSpotlight = gsap.quickTo(spotlightRef.current, 'x', {
          duration: 0.6,
          ease: 'power3.out',
        })
        const moveSpotlightY = gsap.quickTo(spotlightRef.current, 'y', {
          duration: 0.6,
          ease: 'power3.out',
        })
        const onHeroMove = (event: MouseEvent) => {
          const rect = rootRef.current!.getBoundingClientRect()
          moveSpotlight(event.clientX - rect.left)
          moveSpotlightY(event.clientY - rect.top)
        }
        rootRef.current?.addEventListener('mousemove', onHeroMove)
        cleanupFns.push(() => rootRef.current?.removeEventListener('mousemove', onHeroMove))
      }
    }, rootRef)

    return () => {
      cleanupFns.forEach((fn) => fn())
      ctx.revert()
    }
  }, [])

  return (
    <section
      id="hero"
      ref={rootRef}
      className="relative isolate min-h-[94vh] overflow-hidden bg-[#080809] pb-14 pt-28 text-white sm:pt-32"
    >
      <svg
        aria-hidden
        viewBox="0 0 700 600"
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-[55%] opacity-25"
        preserveAspectRatio="xMaxYMid slice"
      >
        {NETWORK_LINES.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={NETWORK_DOTS[a].cx}
            y1={NETWORK_DOTS[a].cy}
            x2={NETWORK_DOTS[b].cx}
            y2={NETWORK_DOTS[b].cy}
            stroke="white"
            strokeOpacity={0.4}
            strokeWidth={1}
          />
        ))}
        {NETWORK_DOTS.map((dot, index) => (
          <circle key={index} cx={dot.cx} cy={dot.cy} r={dot.r} fill="white" />
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-primary/20 via-transparent to-transparent" />

      <div
        ref={spotlightRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 opacity-0 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="max-w-xl">
          <p
            data-hero-eyebrow
            className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50"
          >
            <span className="h-px w-8 bg-white/30" />
            Real-time human connection
            <span className="h-px w-8 bg-white/30" />
          </p>

          <h1 className="mt-6 font-display text-[3.2rem] font-extrabold leading-[0.95] tracking-tight sm:text-[4rem] lg:text-[4.4rem]">
            <span data-hero-line className="block">
              The world
            </span>
            <span
              data-hero-line
              className="gradient-text-animate mt-1 block font-normal italic"
            >
              in your pocket
            </span>
          </h1>

          <p data-hero-copy className="mt-6 max-w-md text-lg leading-relaxed text-white/60">
            Share moments, messages, and presence — with anyone, anywhere, the
            instant you hit send.
          </p>

          <div data-hero-cta className="mt-9 flex flex-wrap items-center gap-5">
            <Button
              size="lg"
              onClick={go}
              isLoading={isLoading}
              className="group bg-white text-base font-semibold text-gray-900 hover:bg-white/90 active:bg-white/80"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <span className="text-sm text-white/40">
              No account. No credit card. Just connect.
            </span>
          </div>
        </div>

        <div className="relative mx-auto h-[360px] w-full max-w-sm sm:h-[440px] sm:max-w-md lg:h-[520px]">
          {FLOAT_CARDS.map((card) => (
            <figure
              key={card.alt}
              data-hero-card
              className={`absolute aspect-[16/11] overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50 ${card.className}`}
            >
              <img
                src={card.src}
                alt={card.alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30">
        Scroll
        <span className="h-8 w-px bg-white/20" />
      </div>
    </section>
  )
}

export { HeroSection }
