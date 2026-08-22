import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAuthCta } from './use-auth-cta'

const FinalCtaSection = () => {
  const { label, go, isLoading, isAuthenticated } = useAuthCta()

  return (
    <section className="relative overflow-hidden bg-gray-950 py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/70 via-indigo-900/75 to-black/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div
        data-reveal
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
      >
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Ready to jump in?
        </h2>
        <p className="mt-4 max-w-md text-white/70">
          {isAuthenticated
            ? 'Pick up right where you left off.'
            : 'Free to join. No password, no credit card — just your phone number.'}
        </p>
        <Button
          size="lg"
          onClick={go}
          isLoading={isLoading}
          className="group mt-8 bg-white text-base font-semibold text-gray-900 hover:bg-white/90 active:bg-white/80"
        >
          {label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </section>
  )
}

export { FinalCtaSection }
