import * as React from 'react'
import gsap from 'gsap'

/**
 * A small dot glued to the pointer plus a slower-trailing ring — the
 * landing page's one bespoke interactive touch. Skipped entirely on
 * touch devices (no real cursor to follow) and reduced-motion.
 */
const CursorFollower = () => {
  const dotRef = React.useRef<HTMLDivElement>(null)
  const ringRef = React.useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = React.useState(false)

  React.useEffect(() => {
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(hasFinePointer && !reducedMotion)
  }, [])

  React.useEffect(() => {
    if (!enabled || !dotRef.current || !ringRef.current) return

    const moveDot = gsap.quickTo(dotRef.current, 'x', { duration: 0.12, ease: 'power3.out' })
    const moveDotY = gsap.quickTo(dotRef.current, 'y', { duration: 0.12, ease: 'power3.out' })
    const moveRing = gsap.quickTo(ringRef.current, 'x', { duration: 0.4, ease: 'power3.out' })
    const moveRingY = gsap.quickTo(ringRef.current, 'y', { duration: 0.4, ease: 'power3.out' })

    const onMove = (event: MouseEvent) => {
      moveDot(event.clientX)
      moveDotY(event.clientY)
      moveRing(event.clientX)
      moveRingY(event.clientY)
    }

    const onOver = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest('a, button, [role="button"]')
      gsap.to(ringRef.current, {
        scale: target ? 1.8 : 1,
        borderColor: target ? '#fcd34d' : '#5347ac',
        duration: 0.25,
      })
      gsap.to(dotRef.current, {
        backgroundColor: target ? '#fcd34d' : '#5347ac',
        duration: 0.25,
      })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[60] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_14px_3px_rgba(83,71,172,0.55)]"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[60] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary shadow-[0_0_18px_2px_rgba(83,71,172,0.3)]"
      />
    </>
  )
}

export { CursorFollower }
