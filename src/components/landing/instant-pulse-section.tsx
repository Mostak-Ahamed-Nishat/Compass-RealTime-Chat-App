import * as React from 'react'
import { Check, MessageSquare } from 'lucide-react'

const TAGS = [
  'Real-time delivery',
  'Typing indicators',
  'Live status',
  'Read receipts',
  'Auto-reconnect',
]

const BAR_COUNT = 64

/**
 * The "spotlight" version of real-time delivery — FeaturesSection covers
 * the full grid further down, this is the one differentiator called out
 * on its own. The canvas bars represent message latency/activity, not
 * audio — deliberately distinct from a voice-note waveform, since voice
 * notes aren't a feature this API supports.
 */
function usePulseCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = window.devicePixelRatio || 1

    const barPhases = Array.from({ length: BAR_COUNT }, (_, i) => ({
      phase: (i / BAR_COUNT) * Math.PI * 4,
      speed: 1.4 + ((i * 37) % 10) / 20,
    }))

    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)

      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, '#5347ac')
      gradient.addColorStop(0.5, '#fcd34d')
      gradient.addColorStop(1, '#5347ac')
      ctx.fillStyle = gradient

      const gap = width / BAR_COUNT
      const barWidth = gap * 0.55
      const t = reducedMotion ? 0 : time / 500

      for (let i = 0; i < BAR_COUNT; i++) {
        const { phase, speed } = barPhases[i]
        const wave = Math.sin(t * speed + phase) * 0.5 + 0.5
        const barHeight = Math.max(4, wave * height * 0.85)
        const x = i * gap + (gap - barWidth) / 2
        const y = (height - barHeight) / 2
        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2)
        } else {
          ctx.rect(x, y, barWidth, barHeight)
        }
        ctx.fill()
      }
    }

    let frameId: number

    if (reducedMotion) {
      draw(0)
    } else {
      const loop = (time: number) => {
        draw(time)
        frameId = requestAnimationFrame(loop)
      }
      frameId = requestAnimationFrame(loop)
    }

    const onResize = () => {
      resize()
      if (reducedMotion) draw(0)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [canvasRef])
}

const InstantPulseSection = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  usePulseCanvas(canvasRef)

  return (
    <section className="relative overflow-hidden bg-[#0b0b12] py-24 text-white">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-[100px]" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            Because waiting isn&apos;t an option
          </p>

          <h2 className="mt-4 font-display text-5xl font-extrabold leading-[0.95] sm:text-6xl">
            Feel the{' '}
            <span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.3)]">
              instant.
            </span>
          </h2>

          <p className="mt-5 max-w-md text-white/60">
            Messages land the moment you hit send — no spinners, no
            refreshing. Socket.io keeps every conversation live.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-2xl" />

          <div className="rounded-3xl border border-white/10 bg-[#111118] p-8 shadow-2xl shadow-black/50 sm:p-10">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping-ring" />
              <span
                className="absolute inset-0 rounded-full bg-primary/20 animate-ping-ring"
                style={{ animationDelay: '0.6s' }}
              />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <MessageSquare className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-8 h-24 w-full">
              <canvas ref={canvasRef} className="h-full w-full" />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-white/40">
              <span>Delivered</span>
              <span className="font-semibold text-emerald-300">&lt; 40ms</span>
            </div>
          </div>

          <div className="absolute -left-8 top-6 hidden items-center gap-1.5 rounded-full border border-white/10 bg-[#15151d] px-3 py-1.5 text-[11px] font-medium text-white/70 shadow-lg sm:flex">
            <Check className="h-3 w-3 text-emerald-300" />
            Read
          </div>
          <div className="absolute -bottom-4 right-10 hidden items-center gap-1.5 rounded-full border border-white/10 bg-[#15151d] px-3 py-1.5 text-[11px] font-medium text-white/70 shadow-lg sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            Typing…
          </div>
        </div>
      </div>
    </section>
  )
}

export { InstantPulseSection }
