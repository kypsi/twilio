import { Chats } from "./chat"
import { Contact } from "./contact"
import { User } from "./user"

export type AppContextType = {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    selectedChatNumber: string
    setSelectedChatNumber: (id: string) => void
    chats: Chats[]
    setChats: (chats: Chats[]) => void
    selectedConversationId: string | null
    setSelectedConversationId: (id: string | null) => void,
    showNewMessageComposer: boolean,
    setShowNewMessageComposer: (show: boolean) => void
    selectedChat: string | null;
    setSelectedChat: (chat: string | null) => void;
    contacts: Contact[];
    setContacts: (contacts: Contact[]) => void
}
