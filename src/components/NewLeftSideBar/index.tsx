'use client';

import { useApp } from '@/context/AppContext';
import React, { useEffect, useState } from 'react';
import { IoAdd } from "react-icons/io5";
import default_profile from "../../assest/default_profile.jpg";
import Image from 'next/image';

interface ChatPreview {
    number: string;
    message: string;
    time: string;
}

const NewLeftSideBar = () => {
    const { setShowNewMessageComposer, user, setSelectedChat, contacts } = useApp();
    const [chats, setChats] = useState<ChatPreview[]>([]);

    useEffect(() => {
        const fetchChats = async () => {
            if (!user?.twilioNumber) return;
            const res = await fetch('/api/dev/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ twilioNumber: user?.twilioNumber }),
            });
            const data = await res.json();
            if (data.success) {
                setChats(data.chats);
            }
        };

        fetchChats();
    }, [user?.twilioNumber]);

    const getContactName = (number: string) => {
        // console.log("Contacts from context:", contacts);
        // console.log("Looking for contact with number:", number);
        const found = contacts.find(contact => contact.phoneNumber === number);
        // console.log("Matched contact:", found);
        return found?.name || number;
    };
    

    return (
        <div className="w-full md:bg-white md:rounded-2xl lg:rounded-3xl md:shadow-md h-full">
            <button onClick={() => setShowNewMessageComposer(true)} className='flex items-center gap-1.5 lg:gap-x-3 text-black px-4 pt-2 pb-1 lg:py-4 text-base border-b border-gray-200 w-full cursor-pointer'>
                <div className="w-[50px] h-[50px] rounded-full p-3"><IoAdd className='w-full h-full' /></div> Send New Message
            </button>
            <div className="py-3 px-2 overflow-y-auto md:h-[calc(100vh_-_82px_-_16px_-_63px_-_40px)] lg:h-[calc(100vh_-_82px_-_16px_-_83px_-_40px)]">
                {chats.map((chat, idx) => (
                    <button key={idx} onClick={() => {
                        setSelectedChat(chat.number)
                        setShowNewMessageComposer(false)
                    }
                    } className="flex gap-3 lg:gap-4 py-3 px-2 w-full items-center rounded-sm md:rounded-2xl lg:rounded-3xl transition-all duration-300 ease-in-out hover:bg-[#e9e9e9] cursor-pointer">
                        <Image
                            src={default_profile}
                            alt="Profile"
                            width={45}
                            height={45}
                            className="rounded-full object-cover"
                        />
                        <div className="w-full">
                            <div className="flex justify-between gap-x-2">
                                <p className='text-sm text-black text-left font-semibold'>{getContactName(chat.number)}</p>
                                {/* <p className='text-sm text-black'>{chat.number}</p> */}
                                <p className='text-sm text-gray-500'>{new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <p className='text-xs text-black text-left truncate max-w-[200px] w-full'>
                                last message: {chat.message}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default NewLeftSideBar;

