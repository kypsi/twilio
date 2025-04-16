"use client"
import { useState, useEffect } from 'react';

const senderOptions = [
    { name: "only working", number: "+16813217557" },
    { name: "oggy", number: "+16813217557" },
    { name: "Charlie", number: "+16813317557" },
    { name: "David", number: "+16813117557" },
    { name: "Emma", number: "+16819217557" },
    { name: "Frank", number: "+16813717557" },
];

interface HistoryItem {
    id: string;
    from: string;
    to: string;
    message: string;
    date: string;
}

const MessageApp = () => {
    const [message, setMessage] = useState('');
    const [senderNumber, setSenderNumber] = useState('');
    const [numbers, setNumbers] = useState<string[]>([]);
    const [phoneInput, setPhoneInput] = useState('');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [error, setError] = useState('');
    const [status, setStatus] = useState<string>("");

    useEffect(() => {
        // Fetch message history
        fetch('/api/message-history')
            .then(res => res.json())
            .then(data => setHistory(data.records))
            .catch(err => console.error('Error fetching message history:', err));
    }, []);

    const handleSendMessage = async () => {
        setStatus("");
        setError("");

        if (!message || !numbers.length || !senderNumber) {
            setError("Sender number, recipient numbers, and message are required.");
            return;
        }

        setStatus("Sending...");
        try {
            const response = await fetch('/api/send-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ senderNumber, numbers, message }),
            });

            const data = await response.json();
            if (data.success) {
                setStatus("Message sent successfully.");
                console.log('Messages sent and history saved!');
                setMessage('');
                setNumbers([]);
                setHistory(prevHistory => [
                    ...prevHistory,
                    {
                        id: `${Date.now()}`, // Generate a unique id (e.g., timestamp)
                        from: senderNumber,
                        to: numbers.join(', '),
                        message: message,
                        date: new Date().toISOString(), // Current date/time
                    },
                ]);
            } else {
                setError('Failed to send messages: ' + data.error);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err instanceof Error ? err.message : "Unknown error occurred.");
        }
    };

    const isValidPhoneNumber = (num: string) => /^[\d+\s-]+$/.test(num.trim());

    const addPhoneNumber = () => {
        setError(""); // Reset error message

        if (!phoneInput.trim()) {
            setError("Phone number cannot be empty.");
            return;
        }

        if (!isValidPhoneNumber(phoneInput)) {
            setError("Invalid phone number format.");
            return;
        }

        if (numbers.includes(phoneInput.trim())) {
            setError("This number is already added.");
            return;
        }

        setNumbers((prev) => [...prev, phoneInput.trim()]);
        setPhoneInput("");
    };

    

    return (
        <div className="flex h-screen">
            {/* Message History */}
            <div className="w-1/3 p-4 bg-gray-100 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Message History</h2>
                <ul>
                    {history.map((item, index) => (
                        <li key={index} className="border-b py-2">
                            <div><strong>From:</strong> {item.from}</div>
                            <div><strong>To:</strong> {item.to}</div>
                            <div><strong>Message:</strong> {item.message}</div>
                            <div className="text-sm text-gray-500"><strong>Date:</strong> {item.date}</div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Message Form */}
            <div className="w-2/3 p-4 bg-white border-l border-gray-300">
                <h2 className="text-xl font-semibold mb-4">Send a Message</h2>

                {/* Sender Selection */}
                <div className="mb-4">
                    <label htmlFor="senderNumber" className="block text-sm font-medium text-gray-700">From:</label>
                    <select
                        id="senderNumber"
                        className="w-full mt-2 border border-gray-300 p-2 rounded"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                    >
                        <option value="">Select a sender number</option>
                        {senderOptions.map((opt) => (
                            <option key={opt.number} value={opt.number}>
                                {opt.name} ({opt.number})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Phone Input */}
                <div className="mb-4 flex gap-2">
                    <input
                        type="text"
                        id="phoneInput"
                        className="w-full mt-2 border border-gray-300 p-2 rounded"
                        placeholder="Enter phone number"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                    />
                    <button
                        onClick={addPhoneNumber}
                        className="bg-blue-500 text-white py-1 px-4 rounded"
                    >
                        Add
                    </button>
                </div>

                {/* Display Added Numbers */}
                {numbers.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-medium">Added Numbers:</h3>
                        <ul>
                            {numbers.map((num, index) => (
                                <li key={index} className="text-sm text-gray-700">{num}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Message Input */}
                <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message:</label>
                    <textarea
                        id="message"
                        className="w-full mt-2 border border-gray-300 p-2 rounded"
                        rows={4}
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSendMessage}
                    className="w-full bg-blue-500 text-white py-2 rounded mt-4"
                >
                    Send Message
                </button>

                {/* Error Message */}
                {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
                {status && <p className="mt-4 text-center text-sm text-gray-700">{status}</p>}
            </div>
        </div>
    );
};

export default MessageApp;
