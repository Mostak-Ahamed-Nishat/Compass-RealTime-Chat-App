import React, { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from './_app'

export default function ChatPage() {
  const router = useRouter()
  const { currentUser, isLoading } = useContext(AuthContext)

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/')
    }
  }, [isLoading, currentUser, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <div className="w-full flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Compass Chat</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome, {currentUser?.name}
          </p>
        </header>

        <main className="flex-1 p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Chat Panel Coming Soon
            </h2>
            <p className="text-blue-700">
              The chat interface is being built. Check back shortly!
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
