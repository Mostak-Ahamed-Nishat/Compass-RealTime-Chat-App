import * as React from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const YOU_AVATAR =
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format'
const THEM_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format'

const START_DISTANCE = 12750
const YOU_START_LEFT = '4%'
const THEM_START_LEFT = '96%'
const YOU_END_LEFT = '47%'
const THEM_END_LEFT = '53%'

interface AvatarKnobProps {
  src: string
  ring: string
  dot: string
}

const AvatarKnob = ({ src, ring, dot }: AvatarKnobProps) => (
  <div
    className={`relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-[#080809] sm:h-16 sm:w-16 ${ring}`}
  >
    <img src={src} alt="" className="h-full w-full object-cover" />
    <span
      className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#080809] ${dot}`}
    />
  </div>
)

/**
 * Pinned scroll-scrub: as the user scrolls through this section, the two
 * avatars slide from opposite edges to meet in the middle while the
 * distance counter and connecting bar shrink in lockstep. All three are
 * tied to the same ScrollTrigger progress, not separate timings, so they
 * always land in sync regardless of scroll speed.
 */
const DistanceSection = () => {
  const sectionRef = React.useRef<HTMLDivElement>(null)
  const youRef = React.useRef<HTMLDivElement>(null)
  const themRef = React.useRef<HTMLDivElement>(null)
  const fillRef = React.useRef<HTMLDivElement>(null)
  const numberRef = React.useRef<HTMLSpanElement>(null)
  const pulseRef = React.useRef<HTMLDivElement>(null)
  const hasPulsedRef = React.useRef(false)

  React.useEffect(() => {
    if (!sectionRef.current) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(youRef.current, { left: YOU_END_LEFT })
      gsap.set(themRef.current, { left: THEM_END_LEFT })
      gsap.set(fillRef.current, { scaleX: 0 })
      if (numberRef.current) numberRef.current.textContent = '0'
      return
    }

    gsap.registerPlugin(ScrollTrigger)
    const proxy = { progress: 0 }

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=100%',
          scrub: true,
          pin: true,
          onUpdate: (self) => {
            if (self.progress > 0.985 && !hasPulsedRef.current) {
              hasPulsedRef.current = true
              gsap.fromTo(
                pulseRef.current,
                { scale: 0.6, opacity: 0.9 },
                { scale: 2.4, opacity: 0, duration: 0.7, ease: 'power2.out' }
              )
            } else if (self.progress < 0.9) {
              hasPulsedRef.current = false
            }
          },
        },
        defaults: { ease: 'none' },
      })

      timeline
        .to(youRef.current, { left: YOU_END_LEFT }, 0)
        .to(themRef.current, { left: THEM_END_LEFT }, 0)
        .to(fillRef.current, { scaleX: 0 }, 0)
        .to(
          proxy,
          {
            progress: 1,
            onUpdate: () => {
              if (!numberRef.current) return
              const value = Math.round(START_DISTANCE * (1 - proxy.progress))
              numberRef.current.textContent = value.toLocaleString()
            },
          },
          0
        )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080809] px-6 text-white"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
        Distance between you and them
      </p>

      <div className="relative mt-16 h-16 w-full max-w-3xl">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/15" />
        <div
          ref={fillRef}
          className="absolute left-1/2 top-1/2 h-px w-full origin-center -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary via-white/50 to-accent"
        />
        <div
          ref={pulseRef}
          aria-hidden
          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent opacity-0 sm:h-20 sm:w-20"
        />

        <div
          ref={youRef}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: YOU_START_LEFT }}
        >
          <AvatarKnob src={YOU_AVATAR} ring="ring-primary" dot="bg-primary" />
        </div>
        <div
          ref={themRef}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: THEM_START_LEFT }}
        >
          <AvatarKnob src={THEM_AVATAR} ring="ring-accent" dot="bg-accent" />
        </div>
      </div>

      <p className="mt-14 flex items-baseline gap-2 font-display text-6xl font-extrabold sm:text-7xl">
        <span ref={numberRef}>{START_DISTANCE.toLocaleString()}</span>
        <span className="text-xl font-normal text-white/40 sm:text-2xl">km apart</span>
      </p>
    </section>
  )
}

export { DistanceSection }
