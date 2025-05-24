import { useApp } from '@/context/AppContext';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import default_profile from "../../assest/default_profile.jpg";
import { BsThreeDotsVertical } from "react-icons/bs";

interface Message {
    _id?: string;
    chat?: string;
    sender_id: string;
    recipient_number: string;
    message_text: string;
    time_stamp: string;
}

interface Chat {
    _id: string;
    name: string;
    isGroupChat: boolean;
    participantNumbers: string[];
    admin: string;
    lastMessageContent?: string;
}

interface ApiMessage {
  _id: string;
  chat: string;
  sender: string;
  recipients: string[];
  content: string;
  createdAt: string;
}

interface ApiChat {
  _id: string;
  name: string;
  isGroupChat: boolean;
  participantNumbers: string[];
  admin: string;
  lastMessageContent?: string;
}

const ChatWindow: React.FC = () => {
    const { user, selectedChat, contacts } = useApp();
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInfo, setChatInfo] = useState<Chat | null>(null);
    const [newMsg, setNewMsg] = useState("");
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedChat) return;

            const res = await fetch('/api/messages/fetch-chat-messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId: selectedChat }),
            });

            const data = await res.json();
            if (data.success) {
                const mappedMessages = data.messages.map((msg: ApiMessage) => ({
                    _id: msg._id,
                    chat: msg.chat,
                    sender_id: msg.sender,
                    recipient_number: msg.recipients[0],
                    message_text: msg.content,
                    time_stamp: msg.createdAt,
                }));
                setMessages(mappedMessages);
                setChatInfo(data.chat); // ✅ store chat info
            } else {
                console.error('Failed to fetch messages:', data.error);
            }
        };

        fetchMessages();
    }, [selectedChat]);

    const sendMessage = async () => {
        if (!newMsg || !user?.id || !user?.twilioNumber || !chatInfo) return;
        setIsSending(true);

        const recipients = chatInfo.participantNumbers.filter(num => num !== user.twilioNumber);

        try {
            const res = await fetch('/api/messages/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: user.twilioNumber,
                    to: recipients,
                    body: newMsg,
                }),
            });

            const data = await res.json();

            if (data.success) {
                const newMessage: Message = {
                    sender_id: user.id,
                    recipient_number: recipients[0], // or leave as empty if group
                    message_text: newMsg,
                    time_stamp: new Date().toISOString(),
                };
                setMessages(prev => [...prev, newMessage]);
                setNewMsg('');

                // 🔁 OPTIONAL: refetch chats to sync last message + update selected chat info
                const updatedChatsRes = await fetch('/api/messages/fetch-chats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ twilioNumber: user.twilioNumber }),
                });
                const updatedChats = await updatedChatsRes.json();
                if (updatedChats.success) {
                    const latestChat = updatedChats.chats.find((chat: ApiChat) => chat._id === data.chatId);
                    if (latestChat) {
                        // Update chatInfo and any global context if needed
                        setChatInfo(latestChat);
                    }
                }

            } else {
                alert('Message failed to send');
                console.error(data.message || data.error);
            }

        } catch (err) {
            console.error('Send error:', err);
        } finally {
            setIsSending(false);
        }
    };


    const getContactName = (number: string) => {
        const found = contacts.find(contact => contact.phoneNumber === number);
        return found?.name || number;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm">
                <div className="flex items-center gap-3">
                    <Image
                        src={default_profile}
                        alt="Profile"
                        width={45}
                        height={45}
                        className="rounded-full object-cover"
                    />
                    <div className="font-medium text-sm">
                        {chatInfo
                            ? chatInfo.isGroupChat
                                ? chatInfo.name
                                : getContactName(chatInfo.participantNumbers.find(num => num !== user?.twilioNumber) || '')
                            : "No contact selected"}
                    </div>
                </div>
                <button>
                    <BsThreeDotsVertical />
                </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50">
                {messages.map((msg, i) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                        <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow ${isMe ? 'bg-green-300' : 'bg-white'}`}>
                                <div>{msg.message_text}</div>
                                <div className={`text-[10px] text-gray-500 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.time_stamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Section */}
            <div className="flex px-4 py-3 border-t bg-white">
                <input
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    className="flex-1 border rounded-full px-4 py-2 outline-none"
                    placeholder="Type a message"
                />
                <button
                    onClick={sendMessage}
                    className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-full"
                    disabled={isSending}
                >
                    {isSending ? "Sending..." : "Send"}
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
