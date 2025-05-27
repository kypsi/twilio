import { useApp } from '@/context/AppContext';
import React, { useState } from 'react';
import { countries } from '../Keypad';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

const NewMessageComposer = () => {
    const { user, contacts, setChats, setSelectedChat, setShowNewMessageComposer } = useApp();
    const [numbers, setNumbers] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
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
            <div className="max-w-2xl mx-auto bg-gradient-to-tr from-indigo-50 to-white  rounded-2xl shadow-lg p-6 space-y-6">
                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900">Lets compose a new message</h2>

                {/* Recipients */}
                {numbers.length > 0 && (
                    <div className='flex justify-between'>
                        <label className="block text-gray-700 mb-1 font-semibold">To:</label>
                        <div className="flex flex-wrap gap-2">
                            {numbers.map((num, idx) => (
                                <span
                                    key={idx}
                                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                                >
                                    {num}
                                    <button
                                        onClick={() => handleRemoveNumber(num)}
                                        className="text-indigo-500 hover:text-indigo-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input & Add */}
                <div className="flex gap-3 items-center">
                    <select
                        className="border border-gray-300 rounded-md px-3 py-2 bg-gray-100 w-24 text-gray-700 focus:ring-2 focus:ring-indigo-400"
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
                        className="flex-grow border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Enter phone number"
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNumber()}
                    />

                    <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-md focus:ring-2 focus:ring-indigo-400 transition"
                        onClick={handleAddNumber}
                    >
                        Add
                    </button>
                </div>
                {/* Contacts Toggle */}
                <div>
                    <button
                        type="button"
                        onClick={() => setContactsOpen(!contactsOpen)}
                        className="flex items-center gap-2 text-indigo-600 font-medium hover:underline"
                    >
                        Add from contacts
                        {contactsOpen ? <FiChevronDown /> : <FiChevronRight />}
                    </button>

                    {contactsOpen && (
                        <div className="mt-3 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50 space-y-2">
                            {contacts.length === 0 ? (
                                <p className="text-gray-500">No saved contacts found.</p>
                            ) : (
                                contacts.map((c) => (
                                    <button
                                        key={c._id}
                                        type="button"
                                        className={`w-full text-left px-3 py-2 rounded hover:bg-indigo-100 ${numbers.includes(c.phoneNumber) ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        onClick={() => handleAddContactNumber(c.phoneNumber)}
                                        disabled={numbers.includes(c.phoneNumber)}
                                    >
                                        {c.name} — {c.phoneNumber}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Status message */}
                {status && (
                    <div
                        className={`p-3 rounded-md text-sm font-medium text-center ${status.type === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                    >
                        {status.message}
                        {status.type === 'success' && ` to numbers ${numbers.join(', ')}`}
                    </div>
                )}

                {/* Message Input */}
                <div className="flex gap-3 pt-2 border-t border-gray-200">
                    <input
                        type="text"
                        className="flex-grow border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-md transition disabled:opacity-50"
                        onClick={handleSend}
                        disabled={loading || numbers.length === 0 || !message.trim()}
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default NewMessageComposer;
