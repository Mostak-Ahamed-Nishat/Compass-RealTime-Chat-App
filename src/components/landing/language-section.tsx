import * as React from 'react'

interface Greeting {
  text: string
  language: string
}

const GREETINGS: Greeting[] = [
  { text: 'Hello', language: 'English' },
  { text: 'হ্যালো', language: 'Bangla' },
  { text: 'Привет', language: 'Russian' },
  { text: 'こんにちは', language: 'Japanese' },
  { text: 'مرحبا', language: 'Arabic' },
]

interface GhostWord {
  text: string
  className: string
}

const GHOST_WORDS: GhostWord[] = [
  { text: 'Bonjour', className: 'left-[4%] top-[14%] -rotate-6 text-3xl sm:text-4xl' },
  { text: 'Ciao', className: 'right-[6%] top-[10%] rotate-3 text-2xl sm:text-3xl' },
  { text: 'Hola', className: 'left-[8%] bottom-[16%] rotate-2 text-3xl sm:text-4xl' },
  { text: 'こんにちは', className: 'right-[4%] bottom-[20%] -rotate-3 text-2xl sm:text-3xl' },
  { text: 'नमस्ते', className: 'left-[16%] top-[46%] rotate-1 text-2xl sm:text-3xl' },
  { text: 'Merhaba', className: 'right-[14%] top-[42%] -rotate-2 text-2xl sm:text-3xl' },
]

const CYCLE_MS = 2200

/**
 * A rotating greeting, not a translation feature — Compass doesn't
 * translate anything, it just doesn't get in the way. Plain-text
 * messaging is Unicode by default, so "type in any language" is true
 * without any extra engineering, unlike the reference site's stronger
 * "bridges any gap" claim. The faded background words are purely
 * decorative (static, not part of the rotation) — they fill the space
 * around the focal greeting rather than leaving it stranded in a void.
 */
const LanguageSection = () => {
  const sectionRef = React.useRef<HTMLDivElement>(null)
  const [index, setIndex] = React.useState(0)
  const [running, setRunning] = React.useState(false)

  React.useEffect(() => {
    if (!sectionRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { threshold: 0.4 }
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % GREETINGS.length)
    }, CYCLE_MS)
    return () => clearInterval(id)
  }, [running])

  const current = GREETINGS[index]

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0b0b12] py-32 text-white"
    >
      <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-0 h-96 w-96 translate-x-1/2 rounded-full bg-accent/10 blur-[100px]" />

      <div className="pointer-events-none absolute inset-0 mx-auto hidden max-w-5xl sm:block">
        {GHOST_WORDS.map((word) => (
          <span
            key={word.text}
            className={`absolute select-none font-display font-extrabold text-white/[0.06] ${word.className}`}
          >
            {word.text}
          </span>
        ))}
      </div>

      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
          <span className="h-px w-8 bg-white/30" />
          Say it your way
          <span className="h-px w-8 bg-white/30" />
        </p>

        <h2
          key={current.text}
          className="mt-6 min-h-[1.2em] font-display text-7xl font-extrabold leading-none sm:text-8xl animate-greeting-in"
        >
          {current.text}
        </h2>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/30">
          {current.language}
        </p>

        <p className="mt-6 max-w-md text-white/60">
          Type in whatever language feels natural — Compass is plain text
          underneath, so it never gets in the way.
        </p>
      </div>
    </section>
  )
}

export { LanguageSection }
