'use client';

import { useApp } from '@/context/AppContext';
import React, { useEffect, useRef } from 'react';
import { IoAdd } from "react-icons/io5";
import default_profile from "../../assest/default_profile.jpg";
import Image from 'next/image';
import { FiRefreshCw } from "react-icons/fi";

const NewLeftSideBar = () => {
    const { setShowNewMessageComposer, user, setSelectedChat, chats, setChats, } = useApp();
    // const [chats, setChats] = useState<ChatPreview[]>([]);
    const chatsRef = useRef(chats);
    chatsRef.current = chats;

    const fetchChats = async () => {
        if (!user?.twilioNumber) return;

        try {
            const res = await fetch('/api/messages/fetch-chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ twilioNumber: user?.twilioNumber }),
            });
            const data = await res.json();
            // if (data.success) {
            //     setChats(data.chats);
            // }

            if (data.success && Array.isArray(data.chats)) {
                const newChats = data.chats;
                const currentChatsMap = new Map(chatsRef.current.map(c => [c.chatId, c]));
                let updateNeeded = false;

                // Check for new or updated chats
                for (const newChat of newChats) {
                    const existingChat = currentChatsMap.get(newChat.chatId);
                    if (
                        !existingChat ||
                        existingChat.lastMessage !== newChat.lastMessage ||
                        existingChat.time !== newChat.time
                    ) {
                        updateNeeded = true;
                        break;
                    }
                }
                // Check if chats removed
                if (!updateNeeded && newChats.length !== chatsRef.current.length) {
                    updateNeeded = true;
                }

                if (updateNeeded) {
                    setChats(newChats);
                }
            }
        } catch (error) {
            console.error("Failed to fetch chats:", error);
        }

    };
    useEffect(() => {
        if (!user?.twilioNumber) return;

        fetchChats();
        const interval = setInterval(() => {
            fetchChats();
        }, 5000);

        return () => clearInterval(interval);
    }, [user?.twilioNumber, fetchChats]);

    const formatChatTime = (timeStr: string) => {
        const time = new Date(timeStr);
        const now = new Date();

        const isToday =
            time.getDate() === now.getDate() &&
            time.getMonth() === now.getMonth() &&
            time.getFullYear() === now.getFullYear();

        if (isToday) {
            return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return time.toLocaleDateString([], { month: 'short', day: 'numeric' }); // e.g., "May 23"
        }
    };

    return (
        <div className="w-full md:bg-white md:rounded-2xl lg:rounded-3xl md:shadow-md h-full">
            <div className='flex items-center justify-between px-4 pt-2 pb-1 lg:py-4 border-b border-gray-200'>
                <button onClick={() => setShowNewMessageComposer(true)} className='flex items-center gap-2 text-grey text-sm cursor-pointer hover:underline hover:text-black'>
                    <div className="w-[38px] h-[38px] rounded-full p-1 bg-gray-100"><IoAdd className='w-full h-full' /></div>
                    Send New Message
                </button>
                <button onClick={fetchChats} title="Refresh Chats" className='text-gray-600 hover:text-black p-2 rounded-full transition cursor-pointer'>
                    <FiRefreshCw size={20} />
                </button>
            </div>
            <div className="py-3 px-2 overflow-y-auto md:h-[calc(100vh_-_82px_-_16px_-_63px_-_40px)] lg:h-[calc(100vh_-_82px_-_16px_-_83px_-_40px)]">
                {chats.map((chat, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setSelectedChat(chat.chatId);
                            setShowNewMessageComposer(false);
                        }}
                        className="flex gap-3 lg:gap-4 py-3 px-2 w-full items-center rounded-sm md:rounded-2xl lg:rounded-3xl transition-all duration-300 ease-in-out hover:bg-[#e9e9e9] cursor-pointer">
                        <Image
                            src={default_profile}
                            alt="Profile"
                            width={45}
                            height={45}
                            className="rounded-full object-cover"
                        />
                        <div className="w-full">
                            <div className="flex justify-between gap-x-2">
                                {/* <p className='text-sm text-black text-left font-semibold'> {getContactName(chat.name)}</p> */}
                                <p className='text-sm text-black text-left font-semibold'> {chat.name}</p>
                                {/* <p className='text-sm text-gray-500'>{new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p> */}
                                <p className='text-sm text-gray-500'>{formatChatTime(chat.time)}</p>

                            </div>
                            <p className='text-xs text-black text-left truncate max-w-[200px] w-full'>
                                last message: {chat.lastMessage}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default NewLeftSideBar;

