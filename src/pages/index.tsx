import React, { useContext } from 'react'
import { LoginHero } from '@/components/auth/login-hero'
import { LoginForm } from '@/components/auth/login-form'
import { AuthContext } from './_app'

export default function LoginPage() {
  const { setCurrentUser } = useContext(AuthContext)

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <LoginHero />
      <LoginForm onSuccess={setCurrentUser} />
    </div>
  )
}
