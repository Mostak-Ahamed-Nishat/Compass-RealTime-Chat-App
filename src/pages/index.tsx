import React, { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { LoginHero } from '@/components/auth/login-hero'
import { LoginForm } from '@/components/auth/login-form'
import { AuthContext } from './_app'

export default function LoginPage() {
  const router = useRouter()
  const { currentUser, setCurrentUser, isLoading } = useContext(AuthContext)

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.push('/chat')
    }
  }, [isLoading, currentUser, router])

  if (isLoading || currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <LoginHero />
      <LoginForm onSuccess={setCurrentUser} />
    </div>
  )
}
