import React, { createContext, useState, useEffect } from 'react'
import type { AppProps } from 'next/app'
import '@/styles/globals.css'

export const AuthContext = createContext<any>(null)

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          if (response.ok) {
            const user = await response.json()
            setCurrentUser(user)
          } else {
            localStorage.removeItem('token')
            setError('Session expired. Please log in again.')
          }
        }
      } catch (err) {
        console.error('Session restore failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, isLoading }}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  )
}
