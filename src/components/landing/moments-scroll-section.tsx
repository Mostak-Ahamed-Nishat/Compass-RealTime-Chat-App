import * as React from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface Moment {
  key: string
  image: string
  headline: string
  subtext: string
}

const MOMENTS: Moment[] = [
  {
    key: 'share',
    image:
      'https://images.unsplash.com/photo-1758525226768-2d1b900ba2c0?w=1400&h=1000&fit=crop&auto=format',
    headline: 'Share',
    subtext: 'Every moment worth sending.',
  },
  {
    key: 'reach',
    image:
      'https://images.unsplash.com/photo-1758686254457-6aaca1ca78e0?w=1400&h=1000&fit=crop&auto=format',
    headline: 'Reach',
    subtext: 'No distance too far.',
  },
  {
    key: 'care',
    image:
      'https://images.unsplash.com/photo-1758874960091-3902ffed7305?w=1400&h=1000&fit=crop&auto=format',
    headline: 'Care',
    subtext: 'Be present, even from afar.',
  },
  {
    key: 'together',
    image:
      'https://images.unsplash.com/photo-1758520388468-81e8589ed04e?w=1400&h=1000&fit=crop&auto=format',
    headline: 'Together',
    subtext: "Wherever life takes you, stay close.",
  },
]

/**
 * Pinned horizontal scroll: the track is 4 full-viewport panels wide,
 * translated left in lockstep with vertical scroll. Panel width is fixed
 * by viewport (w-screen), so scrollWidth is known synchronously — no need
 * to wait on image decode before computing the scroll distance.
 */
const MomentsScrollSection = () => {
  const sectionRef = React.useRef<HTMLDivElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const track = trackRef.current!

      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-black">
      <div ref={trackRef} className="flex h-screen w-max">
        {MOMENTS.map((moment) => (
          <article
            key={moment.key}
            className="relative h-screen w-screen shrink-0 overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${moment.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-indigo-900/10 to-black/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

            <div className="relative z-10 flex h-full flex-col justify-end p-10 text-white sm:p-16">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                {moment.headline}
              </p>
              <h3 className="mt-2 font-display text-6xl font-extrabold sm:text-7xl">
                {moment.headline}
              </h3>
              <p className="mt-3 max-w-sm text-white/70">{moment.subtext}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export { MomentsScrollSection }
