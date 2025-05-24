"use client";

import React, { useState } from "react";
import { IoChatbox } from "react-icons/io5";
import { FiMoreVertical } from "react-icons/fi";

interface ContactItemProps {
    id: string ;
    name: string;
    phoneNumber: string;
    onChat: () => void;
    onDeleted: (id: string) => void;  // callback to refresh after delete
    onEdited: (id: string, name: string, phoneNumber: string) => void; // callback after edit
}

const ContactItem = ({
    id,
    name,
    phoneNumber,
    onChat,
    onDeleted,
    onEdited,
}: ContactItemProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);

    const [editName, setEditName] = useState(name);
    const [editPhone, setEditPhone] = useState(phoneNumber);

    // Delete handler
    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/user/delete-contact/?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                onDeleted(id);
                setShowDeletePopup(false);
            } else {
                alert("Failed to delete contact");
            }
        } catch {
            alert("Failed to delete contact");
        }
    };

    // Edit handler
    const handleEdit = async () => {
        if (!editName.trim() || !editPhone.trim()) {
            alert("Name and phone cannot be empty");
            return;
        }
        try {
            const res = await fetch(`/api/user/edit-contact/?id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName.trim(), phoneNumber: editPhone.trim() }),
            });
            if (res.ok) {
                onEdited(id, editName.trim(), editPhone.trim());
                setShowEditPopup(false);
            } else {
                alert("Failed to update contact");
            }
        } catch {
            alert("Failed to update contact");
        }
    };

    return (
        <li className="flex items-center justify-between bg-gray-100 p-3 rounded-xl shadow-sm relative">
            <div className="flex flex-col">
                <span className="font-medium">{name}</span>
                <span className="text-sm text-gray-600">{phoneNumber}</span>
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 rounded-full hover:bg-gray-300"
                    title="More options"
                >
                    <FiMoreVertical />
                </button>

                <button
                    onClick={onChat}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow transition"
                    title="Chat"
                >
                    <IoChatbox />
                </button>
            </div>

            {/* Dropdown menu */}
            {menuOpen && (
                <div
                    className="absolute right-12 top-10 bg-white border rounded shadow-md z-10 w-28"
                    onMouseLeave={() => setMenuOpen(false)}
                >
                    <button
                        onClick={() => {
                            setShowEditPopup(true);
                            setMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-200"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => {
                            setShowDeletePopup(true);
                            setMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-200 text-red-600"
                    >
                        Delete
                    </button>
                </div>
            )}

            {/* Delete confirmation popup */}
            {showDeletePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded p-6 w-80 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Delete Contact</h3>
                        <p>Are you sure you want to delete <strong>{name}</strong>?</p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeletePopup(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit contact popup */}
            {showEditPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded p-6 w-80 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Edit Contact</h3>
                        <label className="block mb-2">
                            Name:
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full border px-2 py-1 rounded mt-1"
                            />
                        </label>
                        <label className="block mb-4">
                            Phone Number:
                            <input
                                type="text"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                className="w-full border px-2 py-1 rounded mt-1"
                            />
                        </label>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowEditPopup(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEdit}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </li>
    );
};

export default ContactItem;
