import * as React from 'react'
import { useRouter } from 'next/router'
import { Logo, type LogoProps } from './logo'

export interface LogoLinkProps extends LogoProps {
  /** Runs in addition to the navigate/scroll-to-top behavior — e.g. closing a mobile menu. */
  onClick?: () => void
}

/**
 * Wraps Logo with the site's one navigation rule for the brand mark: from
 * any other page it goes home; from the home page itself it scrolls to
 * top instead of no-op'ing (there's nowhere else for "go home" to mean).
 */
const LogoLink = ({ onClick, ...logoProps }: LogoLinkProps) => {
  const router = useRouter()

  const handleClick = () => {
    onClick?.()
    if (router.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push('/')
    }
  }

  return (
    <button type="button" onClick={handleClick} aria-label="Go to homepage">
      <Logo {...logoProps} />
    </button>
  )
}

export { LogoLink }
