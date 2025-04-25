import { useApp } from '@/context/AppContext';
import NewMessageComposer from '../NewMassageComposer';
// import { useEffect, useState } from 'react';
import ChatWindow from '../ChatWindow';

const NewCenterSection = () => {
    const { user, loading, showNewMessageComposer, setShowNewMessageComposer, selectedChat } = useApp();
   

    return (
        <div className="w-full md:bg-white md:rounded-2xl lg:rounded-3xl md:shadow-md mb-4 h-full">
            {loading ? (
                <div className="flex justify-center items-center h-full animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
            ) : showNewMessageComposer ? (
                <NewMessageComposer />
            ) : user && selectedChat ? (
                <ChatWindow />
            ) : user ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <h1 className="text-2xl font-bold mb-2">Hey {user.name}!</h1>
                    <p className="text-gray-500">Let’s get started with your messages.</p>
                    <p onClick={() => setShowNewMessageComposer(true)} className="text-blue-500 underline cursor-pointer">click to send new message</p>
                </div>
            ) : (
                <div className="flex justify-center items-center h-full">
                    <p className="text-gray-400">No user found. Please log in.</p>
                </div>
            )}
        </div>
    );
};
export default NewCenterSection;