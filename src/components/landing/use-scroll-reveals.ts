import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

/**
 * GSAP + ScrollTrigger own the landing page's scroll choreography (per
 * CLAUDE.md's animation split); Lenis just makes the scroll feed into
 * ScrollTrigger smoothly instead of jumping. Elements opt in with
 * `data-reveal`; numbers opt in with `data-counter="1234"`.
 */
export function useScrollReveals(containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) return

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    const onTick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', ScrollTrigger.update)

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((group) => {
        const children = gsap.utils.toArray<HTMLElement>(
          '[data-reveal-item]',
          group
        )
        gsap.fromTo(
          children,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: { trigger: group, start: 'top 85%' },
          }
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-counter]').forEach((el) => {
        const target = Number(el.dataset.counter ?? 0)
        const counter = { value: 0 }
        gsap.to(counter, {
          value: target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
          onUpdate: () => {
            el.textContent = Math.round(counter.value).toLocaleString()
          },
        })
      })
    }, containerRef)

    return () => {
      ctx.revert()
      gsap.ticker.remove(onTick)
      lenis.destroy()
    }
  }, [containerRef])
}
