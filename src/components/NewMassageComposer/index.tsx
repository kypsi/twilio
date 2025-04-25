import { useApp } from '@/context/AppContext';
import React, { useState } from 'react';

const NewMessageComposer = () => {
    const [numbers, setNumbers] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const { user } = useApp();

    const handleAddNumber = () => {
        const cleaned = currentInput.trim();
        if (cleaned !== '' && !numbers.includes(cleaned)) {
            setNumbers([...numbers, cleaned]);
            setCurrentInput('');
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
            const res = await fetch('/api/dev/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: user?.twilioNumber,
                    to: numbers,
                    body: message,
                    conversation_id: `conv-${Date.now()}`,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setStatus({ type: 'success', message: `Message sent to ${numbers.length} number(s).` });
                // setNumbers([]);
                setMessage('');
            } else {
                setStatus({ type: 'error', message: 'Failed to send messages.' });
            }
        } catch (error) {
            console.error('Send error:', error);
            setStatus({ type: 'error', message: 'An error occurred while sending.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-semibold mb-4">New Message</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-1">To:</label>
                    <div className="flex gap-2 flex-wrap">
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
                    <div className="flex gap-2 mt-2">
                        <input
                            type="text"
                            className="border p-2 rounded w-full"
                            placeholder="Enter number"
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
            </div>
            {status && (
                <div className={`mb-4 p-2 rounded ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.message}
                    to numbers {numbers.join(', ')}
                </div>
            )}
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
    );
};

export default NewMessageComposer;
