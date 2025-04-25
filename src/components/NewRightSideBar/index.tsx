"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { IoIosKeypad } from "react-icons/io";
import { IoChatbox } from "react-icons/io5";
import { FaDeleteLeft } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa";


const NewRightSideBar = () => {
    const { user, contacts, setContacts, setSelectedChat, setShowNewMessageComposer } = useApp();
    const [showKeypad, setShowKeypad] = useState(false);
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true);
    const [phoneInput, setPhoneInput] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const fetchContacts = async () => {
        const savedBy = user?.twilioNumber;
        if (!savedBy) {
            setError("Something went wrong...")
            return;
        }
        try {
            const res = await fetch(`/api/dev/get-contacts?savedBy=${encodeURIComponent(savedBy)}`);
            const data = await res.json();
            setContacts(data.contacts || []);
            setError("")
        } catch (err) {
            console.error('Error fetching contacts:', err);
            setError("Something went wrong...")
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (user?.twilioNumber) {
            fetchContacts();
        }
    }, [user?.twilioNumber]);


    useEffect(() => {
        const fetchContacts = async () => {
            const savedBy = user?.twilioNumber;
            if (!savedBy) {
                setError("Something went wrong...")
                return
            };
            try {
                const res = await fetch(`/api/dev/get-contacts?savedBy=${encodeURIComponent(savedBy)}`);
                const data = await res.json();
                setContacts(data.contacts || []);
                setError("")
            } catch (err) {
                console.error('Error fetching contacts:', err);
                setError("Something went wrong...")
            } finally {
                setLoading(false);
            }
        };

        if (user?.twilioNumber) {
            fetchContacts();
        }
    }, [user?.twilioNumber]);

    const createContact = async () => {
        setLoading(true);
        setError('');

        const payload = {
            name: nameInput,
            phoneNumber: phoneInput,
            savedBy: user?.twilioNumber,
        };

        try {
            const res = await fetch('/api/dev/save-contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setNameInput("")
                setShowPopup(false)
                await fetchContacts();
            } else {
                const data = await res.json();
                setError(data.error || 'Something went wrong.');
            }
        } catch (err) {
            console.error('Something went wrong:', err);
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="w-full h-full flex flex-col justify-between md:bg-white md:rounded-2xl lg:rounded-3xl md:shadow-md mb-4 relative">
            {/* Contacts */}
            <p>{error && <span className="text-red-500">{error}</span>}</p>
            <div className="p-4 overflow-y-auto flex-1">
                <h2 className="text-lg font-semibold mb-4">Contacts</h2>
                {contacts.length > 0 ? (
                    <ul className="space-y-3">
                        {contacts.map((contact) => (
                            <li
                                key={contact.id}
                                className="flex items-center justify-between bg-gray-100 p-3 rounded-xl shadow-sm"
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium">{contact.name}</span>
                                    <span className="text-sm text-gray-600">{contact.phoneNumber}</span>
                                </div>

                                <button
                                    onClick={() => {
                                        setSelectedChat(contact.phoneNumber);
                                        setShowNewMessageComposer(false);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow transition"
                                    title="Chat"
                                >
                                    <IoChatbox />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No contacts saved.</p>
                )}
            </div>

            {showKeypad && (
                <div className="absolute bottom-16 left-0 right-0 bg-white border-t p-4 rounded-t-2xl shadow-md z-10">
                    {/* Input + Small Save Button Row */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                className="w-full p-2 pr-10 border rounded-lg text-center text-lg"
                                placeholder="Enter phone number"
                            />
                            {phoneInput && (
                                <button
                                    onClick={() => setPhoneInput((prev) => prev.slice(0, -1))}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg"
                                    title="Clear"
                                >
                                   <FaDeleteLeft />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowPopup(true)}
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full flex items-center justify-center"
                            title="Save Contact"
                        >
                           <FaPlus />
                        </button>

                    </div>

                    {/* Keypad grid */}
                    <div className="grid grid-cols-3 gap-3 text-center text-lg font-semibold">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0', '#'].map((d) => (
                            <button
                                key={d}
                                onClick={() => setPhoneInput(prev => prev + d)}
                                className="bg-gray-200 p-4 rounded-xl"
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Toggle Keypad Button */}
            <div className="p-4 border-t">
                <button
                    onClick={() => setShowKeypad(prev => !prev)}
                    className={`w-full flex items-center justify-center gap-2  text-white py-3 bg-blue-400 rounded-full transition hover:opacity-90`}
                >
                    <IoIosKeypad />
                    {showKeypad ? 'Close Keypad' : 'Open Keypad'}
                </button>
            </div>
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-lg space-y-4">
                        <h2 className="text-xl font-semibold">Save Contact</h2>

                        <div className="space-y-2">
                            <label className="block text-sm text-gray-600">Phone Number</label>
                            <input
                                type="text"
                                value={phoneInput}
                                readOnly
                                className="w-full border px-3 py-2 rounded-md bg-gray-100 text-gray-800"
                            />

                            <label className="block text-sm text-gray-600">Name</label>
                            <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="w-full border px-3 py-2 rounded-md"
                                placeholder="Enter name"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setShowPopup(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:underline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await createContact();
                                    setShowPopup(false);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewRightSideBar;
