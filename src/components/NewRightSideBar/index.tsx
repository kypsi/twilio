"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { IoIosKeypad, IoMdAdd } from "react-icons/io";
// import { IoChatbox } from "react-icons/io5";
// import { FaDeleteLeft } from "react-icons/fa6";
// import { FaPlus } from "react-icons/fa";
import ContactItem from '../ContactItem';
import Keypad from '../Keypad';


const NewRightSideBar = () => {
    const { user, contacts, setContacts, setSelectedChat, setShowNewMessageComposer } = useApp();
    const [showKeypad, setShowKeypad] = useState(false);
    const [error, setError] = useState<string>('')
    const [contactSaveError, setContactSaveError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true);
    const [basePhoneInput, setBasePhoneInput] = useState('');
    const [phoneInput, setPhoneInput] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const fetchContacts = async () => {
        const savedBy = user?.id;
        if (!savedBy) {
            setError("Something went wrong...")
            return;
        }
        try {
            const res = await fetch(`/api/user/get-contacts?savedBy=${encodeURIComponent(savedBy)}`);
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
        if (user?.id) {
            fetchContacts();
        }
    }, [user?.id]);

    const createContact = async () => {
        setLoading(true);
        setContactSaveError('');

        const trimmedName = nameInput.trim();
        const trimmedPhone = phoneInput.trim();

        // Basic phone number validation (e.g., at least 10 digits and only numbers)
        // const phoneRegex = /^\d{10,15}$/;

        // Input validation
        if (!trimmedName || !trimmedPhone) {
            setContactSaveError('Both name and phone number are required.');
            setLoading(false);
            return;
        }

        // if (!phoneRegex.test(trimmedPhone)) {
        //     setContactSaveError('Enter a valid phone number (10-15 digits).');
        //     setLoading(false);
        //     return;
        // }

        if (!user?.id) {
            setContactSaveError('User ID missing. Please log in again.');
            setLoading(false);
            return;
        }

        const payload = {
            name: trimmedName,
            phoneNumber: trimmedPhone,
            savedBy: user?.id,
        };

        try {
            const res = await fetch('/api/user/save-contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setNameInput("");
                setPhoneInput("");
                setBasePhoneInput(""); // reset for keypad
                setShowPopup(false);
                setContactSaveError('');
                await fetchContacts();
            } else {
                const data = await res.json();
                setContactSaveError(data.error || 'Something went wrong.');
            }
        } catch (err) {
            console.error('Something went wrong:', err);
            setContactSaveError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteContact = () => {
        fetchContacts();
    }

    const handleEditContact = () => {
        fetchContacts();
    };


    return (
        <div className="w-full h-full flex flex-col justify-between md:bg-white md:rounded-2xl lg:rounded-3xl md:shadow-md mb-4 relative">
            {/* Contacts */}
            <p>{error && <span className="text-red-500">{error}</span>}</p>
            <div className="p-4 overflow-y-auto flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Contacts</h2>
                    <button
                        onClick={() => setShowKeypad(prev => !prev)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full"
                        title={showKeypad ? "Close Keypad" : "Add New Contact"}
                    >
                        <IoMdAdd className="text-2xl" />
                    </button>
                </div>
                {loading ? (
                    <p className="text-sm text-gray-500">Loading contacts...</p>
                ) : contacts.length > 0 ? (
                    <ul className="space-y-3">
                        {contacts.map((contact) => (
                            <ContactItem
                                key={contact._id!}
                                id={contact._id!}
                                name={contact.name}
                                phoneNumber={contact.phoneNumber}
                                onChat={() => {
                                    setSelectedChat(contact.phoneNumber);
                                    setShowNewMessageComposer(false);
                                }}
                                onDeleted={handleDeleteContact}
                                onEdited={handleEditContact}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No contacts saved.</p>
                )}

            </div>

            {showKeypad && (
                <Keypad
                    phoneInput={basePhoneInput}
                    setPhoneInput={setBasePhoneInput}
                    onSave={(fullNumber: string) => {
                        setPhoneInput(fullNumber); // full number includes country code
                        setShowPopup(true);
                    }}
                />
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
                                onClick={() => {
                                    setPhoneInput("");
                                    setShowPopup(false);
                                    setContactSaveError('');
                                }}
                                className="px-4 py-2 text-sm text-gray-600 hover:underline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await createContact();
                                    // setShowPopup(false);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                        <p>{contactSaveError && <span className="text-red-500">{contactSaveError}</span>}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewRightSideBar;
