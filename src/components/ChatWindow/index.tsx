import { useApp } from '@/context/AppContext';
import React, { useEffect, useState, useRef } from 'react';
import { BsThreeDotsVertical } from "react-icons/bs";
import ChatHeader from '../ChatHeader';
import { IoMdAttach } from 'react-icons/io';
import { IoSend } from 'react-icons/io5';

interface Message {
    _id?: string;
    chat?: string;
    sender_id: string;
    recipient_number: string;
    message_text: string;
    time_stamp: string;
}

interface Chat {
    createdAt: string | number | Date;
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
    const { user, selectedChat, contacts, setChats } = useApp();
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInfo, setChatInfo] = useState<Chat | null>(null);
    const [newMsg, setNewMsg] = useState("");
    const [isSending, setIsSending] = useState(false);
    // const [chatLoading, setChatLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (!selectedChat) return;

        fetchMessages();

        const interval = setInterval(() => {
            fetchMessages();
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedChat]);

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
            // setMessages(mappedMessages);
            // setChatInfo(data.chat); 
            const isSame =
                messages.length === mappedMessages.length &&
                messages[messages.length - 1]?._id === mappedMessages[mappedMessages.length - 1]?._id;

            if (!isSame) {
                setMessages(mappedMessages);
                setChatInfo(data.chat);
            }
        } else {
            console.error('Failed to fetch messages:', data.error);
        }
    };

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

                const updatedChatsRes = await fetch('/api/messages/fetch-chats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ twilioNumber: user.twilioNumber }),
                });
                const updatedChats = await updatedChatsRes.json();
                setChats(updatedChats.chats);

                console.log("updatedChats after sending message", updatedChats);
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


    const handleRefreshChats = async () => {
        fetchMessages();
    };

    const handleDeleteMessages = () => {
        if (chatInfo?.isGroupChat && chatInfo.admin !== user?.id) {
            alert("Only group admin can delete messages.");
        } else {
            alert("For testing purpose: no message can be deleted.");
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!user?.id) return;
        console.log("userId:", user.id)
        console.log("messageId:", messageId)
        const res = await fetch('/api/messages/delete-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, userId: user.id }),
        });
        const data = await res.json();

        if (data.success) {
            // Remove message locally
            setMessages(prev => prev.filter(m => m._id !== messageId));

            // Update chat info if needed
            if (data.updatedLastMessageContent) {
                setChatInfo(prev => prev ? { ...prev, lastMessageContent: data.updatedLastMessageContent } : prev);
            }
            setOpenDropdownId(null);
        } else {
            alert(data.error || 'Failed to delete message');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-tr from-indigo-50 to-white ">
            {/* chat header */}
            <ChatHeader chatInfo={chatInfo} handleRefreshChats={handleRefreshChats} handleDeleteMessages={handleDeleteMessages} getContactName={getContactName} setChatInfo={setChatInfo} />

            {/* CHAT BODY */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4  from-indigo-50 to-white">
                {messages.map((msg, i) => {
                    const isMe = msg.sender_id === user?.id;
                    const isGroup = chatInfo?.isGroupChat;
                    const showSenderInfo = isGroup && !isMe;
                    const senderName = getContactName(msg.recipient_number);

                    return (
                        <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className="relative group max-w-[75%]">
                                <div
                                    className={`px-4 py-3 rounded-2xl text-sm shadow-md transition duration-200 ${isMe
                                        ? 'bg-green-200 text-gray-800'
                                        : 'bg-white text-gray-900'
                                        } ${isMe && 'pr-10'}`} // Add right padding to make space for the 3-dot icon
                                >
                                    {showSenderInfo && (
                                        <div className="text-xs text-gray-500 font-medium mb-1 ml-1">
                                            {senderName}
                                        </div>
                                    )}

                                    <div className="whitespace-pre-wrap break-words">{msg.message_text}</div>

                                    <div
                                        className={`text-[10px] text-gray-500 mt-2 ${isMe ? 'text-right' : 'text-left'
                                            }`}
                                    >
                                        {new Date(msg.time_stamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>

                                {/* Dropdown Icon (Three Dots) */}
                                {isMe && (
                                    <div className="absolute top-1.5 right-2 p-1">
                                        <BsThreeDotsVertical
                                            onClick={() =>
                                                setOpenDropdownId(
                                                    openDropdownId === msg?._id ? null : msg?._id ?? null
                                                )
                                            }
                                            className="text-gray-600 hover:text-gray-900 cursor-pointer"
                                        />

                                        {/* Dropdown Menu */}
                                        {openDropdownId === msg._id && (
                                            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                                <button
                                                    onClick={() => handleDeleteMessage(msg._id!)}
                                                    className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                                                >
                                                    Delete Message
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>
            {/* Input Section */}
            <div className="flex items-center px-2 py-3  bg-white gap-2 ">
                <div className="flex flex-1 items-center  rounded-md px-4 py-2 shadow-sm">
                    <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500" placeholder="Type a message..." />
                    <button onClick={() => alert('Media upload not available right now')} className="text-gray-500 hover:text-gray-700 transition ml-2" title="Add media" >
                        <IoMdAttach size={22} />
                    </button>
                </div>
                <button
                    onClick={sendMessage}
                    disabled={isSending}
                    className="ml-2 p-2 bg-indigo-600 text-white rounded-full cursor-pointer shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75  disabled:opacity-50 flex items-center justify-center"
                >
                    {isSending ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <IoSend size={20} />
                    )}
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
