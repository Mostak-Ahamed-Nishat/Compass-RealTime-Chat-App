import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button, Logo } from '@/components/ui'
import { useAuthCta } from './use-auth-cta'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#demo', label: 'Live demo' },
  { href: '#how-it-works', label: 'How it works' },
]

const SiteHeader = () => {
  const { isLoading, isAuthenticated, label, go, goToLogin } = useAuthCta()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo variant="dark" />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-28 animate-pulse rounded-xl bg-gray-100" />
          ) : (
            <>
              {!isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={goToLogin}
                >
                  Log in
                </Button>
              )}
              <Button size="sm" onClick={go} className="group">
                {label}
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
