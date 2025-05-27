import { useApp } from '@/context/AppContext';
import NewMessageComposer from '../NewMassageComposer';
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
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-tr from-indigo-50 to-white rounded-3xl shadow-lg ">
                    <div className="mb-6">
                        <svg
                            className="mx-auto mb-4 w-20 h-20 text-indigo-400 animate-bounce"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 14h.01M16 10h.01M12 18a6 6 0 100-12 6 6 0 000 12z" />
                        </svg>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                            Hey, {user.name}!
                        </h1>
                        <p className="text-gray-600 mb-6 max-w-xs mx-auto">
                            Your messages are waiting. Ready to start a new conversation?
                        </p>
                    </div>

                    <button
                        onClick={() => setShowNewMessageComposer(true)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-full cursor-pointer shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
                    >
                        + New Message
                    </button>
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