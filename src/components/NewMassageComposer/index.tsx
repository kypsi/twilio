import { useApp } from '@/context/AppContext';
import React, { useState } from 'react';
import { countries } from '../Keypad';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

// type Contact = {
//     _id: string;
//     name: string;
//     number: string;
//     image?: string;
// };


const NewMessageComposer = () => {
    const { user, contacts, setChats, setSelectedChat, setShowNewMessageComposer } = useApp();
    const [numbers, setNumbers] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    // const [contactsLoading, setContactsLoading] = useState(false);
    // const [contactsError, setContactsError] = useState<string | null>(null);
    const [contactsOpen, setContactsOpen] = useState(false);

    const handleAddNumber = () => {
        const trimmedInput = currentInput.trim();
        if (!trimmedInput) return;

        // Normalize number: add country code if not already included
        let fullNumber = trimmedInput;
        if (!trimmedInput.startsWith('+')) {
            fullNumber = countryCode + trimmedInput;
        }

        if (!numbers.includes(fullNumber)) {
            setNumbers([...numbers, fullNumber]);
            setCurrentInput('');
        }
    };

    const handleAddContactNumber = (num: string) => {
        if (!numbers.includes(num)) {
            setNumbers([...numbers, num]);
        }
    };

    const handleRemoveNumber = (num: string) => {
        setNumbers(numbers.filter((n) => n !== num));
    };

    const handleSend = async () => {
        if (!message) {
            setStatus({ type: 'error', message: 'Please enter a message.' });
            return;
        }
        if (numbers.length === 0) {
            setStatus({ type: 'error', message: 'Please add at least one number.' });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const res = await fetch('/api/messages/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: user?.twilioNumber,
                    to: numbers,
                    body: message,
                }),
            });

            const data = await res.json();
            // if (data.success) {
            //     setStatus({ type: 'success', message: `Message sent.` });
            //     setMessage('');
            //     setNumbers([]);
            // } else {
            //     setStatus({ type: 'error', message: data.message || 'Failed to send messages.' });
            // }


            if (data.success) {
                setStatus({ type: 'success', message: `Message sent.` });
                setMessage('');
                setNumbers([]);

                const updatedChatsRes = await fetch('/api/messages/fetch-chats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ twilioNumber: user?.twilioNumber }),
                });
                const updatedChats = await updatedChatsRes.json();
                setChats(updatedChats.chats);

                // const toParticipants = numbers.sort(); // for comparison
                // const foundChat = updatedChats.chats.find((chat: any) => {
                //     const participantsSorted = [...chat.participantNumbers].sort();
                //     return JSON.stringify(participantsSorted) === JSON.stringify(toParticipants);
                // });
                if (data.chatId) {
                    setSelectedChat(data.chatId);
                    // setSelectedConversationId(foundChat._id);
                    setShowNewMessageComposer(false);
                }

            } else {
                setStatus({ type: 'error', message: data.message || 'Failed to send messages.' });
            }

        } catch (error) {
            console.error('Send error:', error);
            setStatus({ type: 'error', message: 'An error occurred while sending.' });
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <div className="p-6 h-full flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-semibold mb-4">New Message</h2>

                    {/* Numbers input */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">To:</label>
                        <div className="flex gap-2 flex-wrap mb-2">
                            {numbers.map((num, idx) => (
                                <span
                                    key={idx}
                                    className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                                >
                                    {num}
                                    <button
                                        onClick={() => handleRemoveNumber(num)}
                                        className="ml-1 text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>

                        {/* Country code + number input */}
                        <div className="flex gap-2">
                            <select
                                className="border p-2 rounded w-20 bg-gray-100"
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                            >
                                {countries.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        ({c.code}) {c.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                className="border p-2 rounded flex-grow"
                                placeholder="Enter phone number"
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNumber()}
                            />
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                onClick={handleAddNumber}
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Toggle contacts */}
                    <div className="mb-4">
                        <button
                            type="button"
                            onClick={() => setContactsOpen(!contactsOpen)}
                            className="flex items-center gap-2 hover:underline focus:outline-none"
                        >
                            Add from contacts
                            {contactsOpen ? <FiChevronDown /> : <FiChevronRight />}
                        </button>

                        {contactsOpen && (
                            <div className="max-h-40 overflow-y-auto border rounded p-2 mt-2 flex flex-col gap-2">
                                {contacts.length === 0 ? (
                                    <p className="text-gray-500">No saved contacts found.</p>
                                ) : (
                                    contacts.map((c) => (
                                        <button
                                            key={c._id}
                                            type="button"
                                            className="text-left hover:bg-gray-100 p-1 rounded cursor-pointer"
                                            onClick={() => handleAddContactNumber(c.phoneNumber)}
                                            disabled={numbers.includes(c.phoneNumber)}
                                        >
                                            {c.name} - {c.phoneNumber}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status message */}
                {status && (
                    <div
                        className={`mb-4 p-2 rounded ${status.type === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {status.message}
                        {status.type === 'success' && ` to numbers ${numbers.join(', ')}`}
                    </div>
                )}

                {/* Message input and send */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="border p-2 rounded w-full"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={handleSend}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </>

    );
};

export default NewMessageComposer;
