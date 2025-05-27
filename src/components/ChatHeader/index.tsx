'use client';

import { useApp } from '@/context/AppContext';
import Image from 'next/image';
import default_profile from "@/assest/default_profile.jpg";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiRefreshCw } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import React, { useState } from 'react';

interface ChatInfo {
    _id: string;
    name: string;
    isGroupChat: boolean;
    participantNumbers: string[];
    admin: string;
    createdAt: string | number | Date;
}

interface Props {
    chatInfo: ChatInfo | null;
    handleRefreshChats: () => void;
    handleDeleteMessages: () => void;
    getContactName: (num: string) => string;
    setChatInfo: React.Dispatch<React.SetStateAction<ChatInfo | null>>;
}

const ChatHeader: React.FC<Props> = ({
    chatInfo,
    handleRefreshChats,
    handleDeleteMessages,
    setChatInfo,
    getContactName,
}) => {
    const { user } = useApp();
    const [showDropdown, setShowDropdown] = useState(false);
    const [renameMode, setRenameMode] = useState(false);
    const [tempName, setTempName] = useState("");
    const [showChatDetails, setShowChatDetails] = useState(false);

    const handleRenameToggle = () => {
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
            setChatInfo((prev) => (prev ? { ...prev, name: tempName.trim() } : null));
            setRenameMode(false);
        } else {
            alert(data.message || "Failed to rename group");
        }
    }
    return (
        <div className="relative  from-indigo-50 to-white">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b  shadow-sm">
                {/* Profile and Chat Info */}
                <div className="flex items-center gap-4">
                    <Image
                        src={default_profile}
                        alt="Profile"
                        width={45}
                        height={45}
                        className="rounded-full object-cover"
                    />
                    <div className="flex flex-col text-sm font-medium text-gray-800">
                        {/* Chat Name or Rename Mode */}
                        {chatInfo ? (
                            chatInfo.isGroupChat ? (
                                renameMode ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            className="border border-gray-300 px-2 py-1 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                        <button onClick={handleRenameChat} className="text-blue-600 text-sm hover:underline">
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
                                    <span className="text-base font-semibold">{chatInfo.name}</span>
                                )
                            ) : (
                                <span className="text-base font-semibold">
                                    {getContactName(
                                        chatInfo.participantNumbers.find((num: string | undefined) => num !== user?.twilioNumber) || ''
                                    )}
                                </span>
                            )
                        ) : (
                            <span className="text-base font-semibold">No contact selected</span>
                        )}
                    </div>
                </div>

                {/* Dropdown Menu */}
                <div className="relative">
                    <button
                        className="text-gray-700 hover:text-black focus:outline-none"
                        onClick={() => setShowDropdown((prev) => !prev)}
                    >
                        {showDropdown ? <IoMdClose size={20} /> : <BsThreeDotsVertical size={20} />}
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-md border z-50">
                            <button
                                onClick={() => {
                                    handleRefreshChats();
                                    setShowDropdown(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100"
                            >
                                Refresh <FiRefreshCw size={16} />
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
                                className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                            >
                                Delete All Messages
                            </button>

                            <button
                                onClick={() => {
                                    setShowChatDetails((prev) => !prev);
                                    setShowDropdown(false);
                                }}
                                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                            >
                                {showChatDetails ? 'Hide Details' : 'Chat Details'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Expandable Chat Details Below Header */}
            <div
                className={`overflow-hidden transition-all duration-300 ${showChatDetails ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                {chatInfo && (
                    <div className="relative  px-5 py-4 border-b text-sm text-gray-700 shadow-inner">

                        <button
                            onClick={() => setShowChatDetails(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <IoMdClose size={18} />
                        </button>

                        <div className="mb-2">
                            <strong>Created On:</strong>{' '}
                            {new Date(chatInfo.createdAt).toLocaleString()}
                        </div>
                        <div className="mb-2">
                            <strong>Admin:</strong>{' '}
                            {chatInfo.admin === user?.id ? 'You' : chatInfo.admin}
                        </div>
                        <div className="mb-2">
                            <strong>Participants ({chatInfo.participantNumbers.length}):</strong>
                            <ul className="ml-4 list-disc">
                                {chatInfo.participantNumbers.map((number: string, idx: number) => (
                                    <li key={idx}>{getContactName(number)}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatHeader;
