export interface Message {
    id: string;
    sender: string;
    receiver: string;
    message: string;
    time: string;
}

export interface Chat {
    number: string;
    message: string;
    time: string;
}

export type Chats = {
    chatId: string;
    name: string;
    isGroupChat: boolean;
    lastMessage: string;
    lastMessageContent: string;
    time: string;
    participantNumbers: string[];
}