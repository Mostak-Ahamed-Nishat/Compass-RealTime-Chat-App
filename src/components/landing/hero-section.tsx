import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui'
import { CommunityAvatars } from '@/components/auth/community-avatars'
import { useAuthCta } from './use-auth-cta'
import { LiveChatPreview } from './live-chat-preview'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const HeroSection = () => {
  const shouldReduceMotion = useReducedMotion()
  const { label, go, isLoading } = useAuthCta()

  const item = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  }

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-white pb-20 pt-16 sm:pb-28 sm:pt-20"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1.05fr_1fr]">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-xl"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
          >
            <Zap className="h-3.5 w-3.5" />
            Real-time messaging, reimagined
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-[3.25rem]"
          >
            Conversations that keep <span className="text-primary">pace</span> with you.
          </motion.h1>

          <motion.p variants={item} className="mt-5 text-lg leading-relaxed text-secondary">
            Connectly brings direct messages, group chats, and instant
            delivery into one clean, fast space — no refreshing, no waiting,
            no clutter.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={go}
              isLoading={isLoading}
              className="group text-base font-semibold"
            >
              {label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <a
              href="#demo"
              className="text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
            >
              Try the live demo ↓
            </a>
          </motion.div>

          <motion.div variants={item} className="mt-10">
            <CommunityAvatars />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24, scale: shouldReduceMotion ? 1 : 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          id="demo"
          className="flex justify-center lg:justify-end"
        >
          <LiveChatPreview />
        </motion.div>
      </div>
    </section>
  )
}

export { HeroSection }
