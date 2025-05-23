// 'use client'
// import React, { useState } from 'react'
// import { User } from '@/types/user'

// interface Props {
//   user: User
//   setEditUser: (user: User | null) => void
//   setUsers: React.Dispatch<React.SetStateAction<User[]>>
// }

// const UpdateUser: React.FC<Props> = ({ user, setEditUser, setUsers }) => {
//   const [form, setForm] = useState({
//     id: user.id,
//     name: user.name,
//     email: user.email,
//     twilioNumber: user.twilioNumber || '',
//     role: user.role,
//     password: '',
//   })

//   const [loading, setLoading] = useState(false)

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async () => {
//     setLoading(true)
//     try {
//       const res = await fetch(`/api/admin/users/update`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(form),
//       })

//       if (!res.ok) throw new Error('Failed to update user.')

//       const updatedUser: User = await res.json()

//       setUsers(prev =>
//         prev.map(u => (u.id === updatedUser.id ? updatedUser : u))
//       )
//       setEditUser(null)
//     } catch (error) {
//       alert('Error updating user.')
//       console.error(error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="bg-white p-6 rounded-xl w-[400px]">
//       <h2 className="text-lg font-semibold mb-4">Edit User</h2>

//       <div className="space-y-3">
//         <input
//           type="text"
//           name="name"
//           value={form.name}
//           onChange={handleChange}
//           placeholder="Name"
//           className="w-full border px-3 py-2 rounded"
//         />
//         <input
//           type="email"
//           name="email"
//           value={form.email}
//           onChange={handleChange}
//           placeholder="Email"
//           className="w-full border px-3 py-2 rounded"
//         />
//         <input
//           type="text"
//           name="twilioNumber"
//           value={form.twilioNumber}
//           onChange={handleChange}
//           placeholder="Twilio Number"
//           className="w-full border px-3 py-2 rounded"
//         />
//         <input
//           type="text"
//           name="role"
//           value={form.role}
//           onChange={handleChange}
//           placeholder="Role"
//           className="w-full border px-3 py-2 rounded"
//         />
//         <input
//           type="password"
//           name="password"
//           value={form.password}
//           onChange={handleChange}
//           placeholder="New Password (optional)"
//           className="w-full border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="flex justify-end gap-2 mt-4">
//         <button
//           onClick={() => setEditUser(null)}
//           className="text-sm text-gray-500"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={handleSubmit}
//           className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
//           disabled={loading}
//         >
//           {loading ? 'Updating...' : 'Update'}
//         </button>
//       </div>
//     </div>
//   )
// }

// export default UpdateUser


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

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs: { [key: string]: string } = {}

    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Invalid email format'
    }

    if (!form.role?.trim()) errs.role = 'Role is required'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const trimmedForm = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        twilioNumber: form.twilioNumber.trim(),
        role: form.role?.trim(),
        password: form.password.trim(),
      }

      const res = await fetch(`/api/admin/update-user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trimmedForm),
      })

      if (!res.ok) throw new Error('Failed to update user.')

      const updatedUser: User = await res.json()

      setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)))
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
          className={`w-full border px-3 py-2 rounded ${errors.name ? 'border-red-500' : ''}`}
          autoFocus
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className={`w-full border px-3 py-2 rounded ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        <input
          type="text"
          name="twilioNumber"
          value={form.twilioNumber}
          onChange={handleChange}
          placeholder="Twilio Number"
          className="w-full border px-3 py-2 rounded"
        />

        <div>
          <label className="block text-sm mb-1">Role:</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded ${errors.role ? 'border-red-500' : ''}`}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
        </div>

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
