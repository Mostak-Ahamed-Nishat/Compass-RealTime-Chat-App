import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAuthCta } from './use-auth-cta'

const FinalCtaSection = () => {
  const { label, go, isAuthenticated } = useAuthCta()

  return (
    <section className="relative overflow-hidden bg-[#0b0b12] py-32 text-white">
      <div className="pointer-events-none absolute left-[10%] top-1/3 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-2/3 h-72 w-72 -translate-y-1/2 rounded-full bg-accent/15 blur-3xl" />

      <div
        data-reveal
        className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 text-center"
      >
        <h2 className="font-display text-4xl font-extrabold leading-[0.95] sm:text-6xl">
          Your people
          <br />
          <span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.25)]">
            are waiting
          </span>
          <br />
          <span className="gradient-text-animate">for you.</span>
        </h2>

        <p className="mt-6 max-w-sm text-white/60">
          {isAuthenticated
            ? 'Pick up right where you left off.'
            : 'No credit card. Just your phone number.'}
        </p>

        <Button
          size="lg"
          onClick={go}
          className="group mt-8 bg-white text-base font-semibold text-gray-900 hover:bg-white/90 active:bg-white/80"
        >
          {isAuthenticated ? label : 'Open Compass — it’s free'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </section>
  )
}

export { FinalCtaSection }
