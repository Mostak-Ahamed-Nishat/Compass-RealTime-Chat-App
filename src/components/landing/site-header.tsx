import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button, Logo } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuthCta } from './use-auth-cta'

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#social-proof', label: 'Community' },
]

/**
 * The hero, marquee, distance, and moments-scroll sections are all dark and
 * full-bleed (wrapped in #dark-intro); everything below is light — so the
 * header tracks whether that dark block is still on screen and swaps its
 * own theme to match, rather than the whole site committing to dark mode.
 */
function useIsOverHero() {
  const [isOverHero, setIsOverHero] = React.useState(true)

  React.useEffect(() => {
    const darkIntro = document.getElementById('dark-intro')
    if (!darkIntro) {
      setIsOverHero(false)
      return
    }

    const headerOffset = 80
    const onScroll = () => {
      const { bottom } = darkIntro.getBoundingClientRect()
      setIsOverHero(bottom > headerOffset)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return isOverHero
}

const SiteHeader = () => {
  const { isLoading, isAuthenticated, label, go, goToLogin } = useAuthCta()
  const isOverHero = useIsOverHero()

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-colors duration-300',
        isOverHero
          ? 'border-b border-white/0 bg-transparent'
          : 'border-b border-gray-100/80 bg-white/80 backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo variant={isOverHero ? 'light' : 'dark'} />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors',
                isOverHero
                  ? 'text-white/60 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div
              className={cn(
                'h-9 w-28 animate-pulse rounded-xl',
                isOverHero ? 'bg-white/10' : 'bg-gray-100'
              )}
            />
          ) : (
            <>
              {!isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'hidden sm:inline-flex',
                    isOverHero && 'text-white hover:bg-white/10 active:bg-white/20'
                  )}
                  onClick={goToLogin}
                >
                  Log in
                </Button>
              )}
              <Button
                size="sm"
                onClick={go}
                className={cn(
                  'group',
                  isOverHero && 'bg-white text-gray-900 hover:bg-white/90 active:bg-white/80'
                )}
              >
                {isAuthenticated ? label : 'Open app'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }
