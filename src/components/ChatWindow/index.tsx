import { useApp } from '@/context/AppContext';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import default_profile from "../../assest/default_profile.jpg";
import { BsThreeDotsVertical } from "react-icons/bs";

interface Message {
    sender_number: string;
    receiver_number: string;
    message_text: string;
    time_stamp: string;
}

const ChatWindow: React.FC = () => {
    const { user, selectedChat, contacts  } = useApp();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMsg, setNewMsg] = useState("");

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user?.twilioNumber || !selectedChat) return;
            const res = await fetch('/api/dev/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: user.twilioNumber,
                    receiver: selectedChat,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            }
        };

        fetchMessages();
    }, [user?.twilioNumber, selectedChat]);

    const sendMessage = async () => {
        if (!newMsg || !user?.twilioNumber || !selectedChat) return;

        const res = await fetch('/api/dev/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: user.twilioNumber,
                to: selectedChat,
                body: newMsg,
                conversation_id: `${user.twilioNumber}-${selectedChat}`
            }),
        });

        const data = await res.json();

        if (data.success) {
            const newMessage = {
                sender_number: user.twilioNumber,
                receiver_number: selectedChat,
                message_text: newMsg,
                time_stamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, newMessage]);
            setNewMsg('');
        } else {
            alert('Message failed to send');
            console.error(data.error);
        }
    };
    
    const getContactName = (number: string) => {
        // console.log("Contacts from context:", contacts);
        // console.log("Looking for contact with number:", number);
        const found = contacts.find(contact => contact.phoneNumber === number);
        // console.log("Matched contact:", found);
        return found?.name || number;
    };
    
    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm">
                <div className="flex items-center gap-3">
                    {/* Profile Image */}
                    <div/>
                    <Image
                        src={default_profile}
                        alt="Profile"
                        width={45}
                        height={45}
                        className="rounded-full object-cover"
                    />
                   <div className="font-medium text-sm">{selectedChat ? getContactName(selectedChat) : "No contact selected"}</div>
                </div>
                {/* 3 dots */}
                <button>
                <BsThreeDotsVertical />
                </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50">
                {messages.map((msg, i) => {
                    const isMe = msg.sender_number === user?.twilioNumber;
                    return (
                        <div
                            key={i}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-green-300' : 'bg-white'
                                    } shadow`}
                            >
                                <div>{msg.message_text}</div>
                                <div
                                    className={`text-[10px] text-gray-500 mt-1 ${isMe ? 'text-right' : 'text-left'
                                        }`}
                                >
                                    {new Date(msg.time_stamp).toLocaleTimeString([], {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
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
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
