'use client'

import { useApp } from '@/context/AppContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useApp()
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === '/login'

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/login')
    }
    if (!loading && user && isLoginPage) {
      router.push('/chat') // Redirect logged-in user away from login page
    }
  }, [user, loading, isLoginPage])

  if (loading) return <div className="p-4">Loading...</div>
  if (!user && !isLoginPage) return null // Prevent flashing content

  return <>{children}</>
}
