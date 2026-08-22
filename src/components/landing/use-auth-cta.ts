import { useContext } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '@/pages/_app'

/**
 * Single source of truth for the landing page's "primary action" branching:
 * logged in -> dashboard, logged out -> login. Keeps the header, hero, and
 * closing CTA in sync without prop-drilling auth state through every section.
 */
export function useAuthCta() {
  const router = useRouter()
  const { currentUser, isLoading } = useContext(AuthContext)

  const isAuthenticated = !!currentUser
  const target = isAuthenticated ? '/chat' : '/login'
  const label = isAuthenticated ? 'Open Dashboard' : 'Get Started Free'

  const go = () => router.push(target)
  const goToLogin = () => router.push('/login')

  return { isLoading, isAuthenticated, target, label, go, goToLogin }
}
