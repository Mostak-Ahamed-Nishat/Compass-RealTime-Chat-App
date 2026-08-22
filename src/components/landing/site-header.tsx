import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Button, LogoLink } from '@/components/ui'
import { useAuthCta } from './use-auth-cta'

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#social-proof', label: 'Community' },
]

const panelVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: 'beforeChildren', staggerChildren: 0.07, delayChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    transition: { when: 'afterChildren', duration: 0.2 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/**
 * The whole page runs on the same dark background now (hero through
 * footer), so the header just stays a permanent glass panel — no more
 * scroll-driven light/dark swap to track.
 */
const SiteHeader = () => {
  const { isLoading, isAuthenticated, label, go, goToLogin } = useAuthCta()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const shouldReduceMotion = useReducedMotion()

  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeAnd = (action: () => void) => () => {
    setMenuOpen(false)
    action()
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#0b0b12]/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <LogoLink variant="light" />

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isLoading ? (
              <div className="h-9 w-28 animate-pulse rounded-xl bg-white/10" />
            ) : (
              <>
                {!isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 active:bg-white/20"
                    onClick={goToLogin}
                  >
                    Log in
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={go}
                  className="group bg-white text-gray-900 hover:bg-white/90 active:bg-white/80"
                >
                  {isAuthenticated ? label : 'Open app'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white md:hidden"
          >
            <motion.span
              animate={{ rotate: menuOpen ? 90 : 0, opacity: menuOpen ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-5 w-5" />
            </motion.span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={shouldReduceMotion ? undefined : panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: shouldReduceMotion ? 0 : undefined }}
            className="fixed inset-0 z-50 flex flex-col bg-[#0b0b12] text-white md:hidden"
          >
            <div
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  'radial-gradient(circle at 30% 20%, rgba(83,71,172,0.35), transparent 55%), radial-gradient(circle at 80% 70%, rgba(252,211,77,0.12), transparent 50%)',
              }}
            />

            <div className="flex h-16 items-center justify-between px-6">
              <LogoLink variant="light" onClick={() => setMenuOpen(false)} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
              >
                <motion.span
                  initial={shouldReduceMotion ? false : { rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                >
                  <X className="h-4 w-4" />
                </motion.span>
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-1 px-6">
              {NAV_LINKS.map((link, index) => (
                <motion.a
                  key={link.href}
                  variants={shouldReduceMotion ? undefined : itemVariants}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-center gap-3 border-b border-white/10 py-5"
                >
                  <span className="text-xs font-bold text-white/30">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-3xl font-extrabold transition-colors group-active:text-white/70">
                    {link.label}
                  </span>
                </motion.a>
              ))}
            </nav>

            <motion.div
              variants={shouldReduceMotion ? undefined : itemVariants}
              className="flex flex-col items-center gap-3 px-6 pb-12"
            >
              <Button
                size="lg"
                onClick={closeAnd(go)}
                isLoading={isLoading}
                className="group w-full max-w-xs bg-white text-base font-semibold text-gray-900 hover:bg-white/90 active:bg-white/80"
              >
                {isAuthenticated ? label : "Start connecting — it's free"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <p className="text-xs text-white/30">No credit card. Just your phone number.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export { SiteHeader }
