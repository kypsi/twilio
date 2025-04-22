"use client"
// context/AppContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types/user'
import axios from 'axios'
import { useRouter } from 'next/navigation'

type AppContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch user on load
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await axios.post('/api/login', { email, password })
      const res = await axios.get('/api/auth/me')
      setUser(res.data.user)
      return true
    } catch (err) {
      return false
    }
  }

  const logout = async () => {
    await axios.post('/api/logout')
    setUser(null)
    router.push('/login')
  }

  return (
    <AppContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
