import { useApp } from '@/context/AppContext';
import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react';
import default_profile from "../../assest/default_profile.jpg";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiRefreshCw } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';

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
    const { user, selectedChat, contacts, setChats } = useApp();
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInfo, setChatInfo] = useState<Chat | null>(null);
    const [newMsg, setNewMsg] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [renameMode, setRenameMode] = useState(false);
    const [tempName, setTempName] = useState("");
    // const [chatLoading, setChatLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

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
    useEffect(() => {

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

    const handleRenameToggle = async () => {
        if (chatInfo) {
            setRenameMode(true);
            setTempName(chatInfo.name);
        }
    };
    const handleRenameChat = async () => {
        if (!tempName.trim() || !chatInfo) return;

        const res = await fetch('/api/messages/change-chat-name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatId: chatInfo._id,
                newName: tempName.trim(),
                adminId: user?.id,
            }),
        });

        const data = await res.json();
        if (data.success) {
            setChatInfo(prev => prev ? { ...prev, name: tempName.trim() } : null);
            setRenameMode(false);
        } else {
            alert(data.message || "Failed to rename group");
        }
    }

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
                        {chatInfo ? (
                            chatInfo.isGroupChat ? (
                                renameMode ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            className="border px-2 py-1 text-sm rounded"
                                        />
                                        <button
                                            onClick={() => { handleRenameChat() }}
                                            className="text-blue-600 text-sm hover:underline"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setRenameMode(false);
                                                setTempName(chatInfo.name);
                                            }}
                                            className="text-gray-500 text-sm hover:underline"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    chatInfo.name
                                )
                            ) : (
                                getContactName(chatInfo.participantNumbers.find(num => num !== user?.twilioNumber) || '')
                            )
                        ) : "No contact selected"}
                    </div>

                </div>
                <div className="relative">
                    <button className='cursor-pointer' onClick={() => setShowDropdown(prev => !prev)}>
                        {showDropdown ? <IoMdClose /> : <BsThreeDotsVertical />}
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded z-10">
                            <button
                                onClick={() => {
                                    handleRefreshChats();
                                    setShowDropdown(false);
                                }}
                                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between"
                            >
                                Refresh <FiRefreshCw size={20} />
                            </button>

                            {chatInfo?.isGroupChat && chatInfo.admin === user?.id && (
                                <button
                                    onClick={() => {
                                        handleRenameToggle();
                                        setShowDropdown(false);
                                    }}
                                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                                >
                                    Rename Group
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    handleDeleteMessages();
                                    setShowDropdown(false);
                                }}
                                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                            >
                                Delete All Messages
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50">
                {messages.map((msg, i) => {
                    const isMe = msg.sender_id === user?.id;
                    const isGroup = chatInfo?.isGroupChat;
                    const showSenderInfo = isGroup && !isMe;
                    const senderName = getContactName(msg.recipient_number);
                    return (
                        <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow ${isMe ? 'bg-green-300' : 'bg-white'}`}>
                                {showSenderInfo && (
                                    <div className="text-xs text-gray-500 font-medium mb-1 ml-1">
                                        {senderName}
                                    </div>
                                )}
                                <div>{msg.message_text}</div>
                                <div className={`text-[10px] text-gray-500 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.time_stamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
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
