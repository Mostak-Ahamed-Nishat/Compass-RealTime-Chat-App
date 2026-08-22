import * as React from 'react'
import { MessageSquarePlus, Phone, Search } from 'lucide-react'

const STEPS = [
  {
    icon: Phone,
    title: 'Sign in with your phone',
    description: 'No password to remember — just your number and your name.',
  },
  {
    icon: Search,
    title: 'Find people instantly',
    description: 'Search by name and see results as you type.',
  },
  {
    icon: MessageSquarePlus,
    title: 'Start talking',
    description: 'Send a message and watch it sync everywhere, instantly.',
  },
]

const HowItWorksSection = () => (
  <section id="how-it-works" className="bg-white py-24">
    <div className="mx-auto max-w-6xl px-6">
      <div data-reveal className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Getting started
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Three steps. No friction.
        </h2>
      </div>

      <div data-reveal-stagger className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-gray-200 sm:block" />
        {STEPS.map((step, index) => (
          <div key={step.title} data-reveal-item className="relative flex flex-col items-start">
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <step.icon className="h-5 w-5" />
            </div>
            <span className="mt-4 text-xs font-bold uppercase tracking-wider text-gray-400">
              Step {index + 1}
            </span>
            <h3 className="mt-1 font-display text-lg font-bold text-gray-900">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export { HowItWorksSection }
