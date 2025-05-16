'use client'
import React, { useState } from 'react'
import { User } from '@/types/user'

interface Props {
  user: User
  setEditUser: (user: User | null) => void
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
}

const UpdateUser: React.FC<Props> = ({ user, setEditUser, setUsers }) => {
  const [form, setForm] = useState({
    id: user.id,
    name: user.name,
    email: user.email,
    twilioNumber: user.twilioNumber || '',
    role: user.role,
    password: '',
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Failed to update user.')

      const updatedUser: User = await res.json()

      setUsers(prev =>
        prev.map(u => (u.id === updatedUser.id ? updatedUser : u))
      )
      setEditUser(null)
    } catch (error) {
      alert('Error updating user.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl w-[400px]">
      <h2 className="text-lg font-semibold mb-4">Edit User</h2>

      <div className="space-y-3">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="twilioNumber"
          value={form.twilioNumber}
          onChange={handleChange}
          placeholder="Twilio Number"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="Role"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="New Password (optional)"
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setEditUser(null)}
          className="text-sm text-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  )
}

export default UpdateUser
