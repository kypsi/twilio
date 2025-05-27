"use client"
// context/AppContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types/user'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { AppContextType } from '@/types/AppContextType'
import { Chats } from '@/types/chat'
import { Contact } from '@/types/contact'


const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    
    const [selectedChatNumber, setSelectedChatNumber] = useState<string>('')
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>("");
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [showNewMessageComposer, setShowNewMessageComposer] = useState(false);

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [chats, setChats] = useState<Chats[]>([])


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
            await axios.post('/api/auth/login', { email, password })
            const res = await axios.get('/api/auth/me')
            setUser(res.data.user)
            console.log('Login successful', res.data.user)
            return true
        } catch (err) {
            console.error('Login error:', err)

            return false
        }
    }

    const logout = async () => {
        await axios.post('/api/auth/logout')
        setUser(null)
        router.push('/login')
    }

    return (
        <AppContext.Provider value={{ user, loading, login, logout, contacts, setContacts, selectedChatNumber, setSelectedChatNumber, chats, setChats, selectedConversationId, setSelectedConversationId, showNewMessageComposer, setShowNewMessageComposer, selectedChat, setSelectedChat }}>
            {children}
        </AppContext.Provider>
    )
}

export const useApp = () => {
    const context = useContext(AppContext)
    if (!context) throw new Error('useApp must be used within AppProvider')
    return context
}
