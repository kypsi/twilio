'use client'
import React, { useEffect, useState } from 'react'
import { EyeIcon, EyeSlashIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { User } from '@/types/user'
import AddUser from '@/components/AddUser'
import UpdateUser from '@/components/UpdateUser'
import { useApp } from '@/context/AppContext'

const Admin = () => {
  const { user } = useApp();
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [viewPassword, setViewPassword] = useState<{ [key: string]: boolean }>({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [deleteError, setDeleteError] = useState('')

  if(user?.role !== 'admin') return <p>you are not supposed to be here. Please contact admin to get access of admin panel.</p>
  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
  }, [])

  const togglePasswordView = async (id: string) => {
    // If password is already shown, just toggle it off
    if (viewPassword[id]) {
      setViewPassword(prev => ({ ...prev, [id]: false }))
      return
    }

    try {
      const res = await fetch(`/api/admin/users/password/${id}`, {
        method: 'GET',
        credentials: 'include', // ensures cookies (token) are sent
      })

      if (!res.ok) {
        throw new Error('Failed to fetch password')
      }

      const data = await res.json()

      // Set the password temporarily in user state
      setUsers(prev =>
        prev.map(user =>
          user.id === id ? { ...user, password: data.password } : user
        )
      )

      setViewPassword(prev => ({ ...prev, [id]: true }))
    } catch (error) {
      console.error(error)
      alert('Failed to fetch password.')
    }
  }
  const handleDeleteUser = async () => {
    if (!deleteUserId) return

    setDeleteError('')
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        credentials: 'include', // to send cookies/token
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: deleteUserId,
          adminPassword,
          adminEmail: user?.email,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setDeleteError(data.message || 'Failed to delete user')
        return
      }

      // Remove deleted user from the list
      setUsers(prev => prev.filter(user => user.id !== deleteUserId))
      setDeleteUserId(null)
      setAdminPassword('')
    } catch (error) {
      console.error(error)
      setDeleteError('Something went wrong')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin – Users</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
        >
          <PlusIcon className="h-5 w-5" />
          Create User
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="overflow-auto rounded-xl border shadow">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100 text-xs font-semibold text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Twilio #</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Password</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{item.name} {user?.twilioNumber === item.twilioNumber && '(You)'}</td>
                    <td className="px-6 py-4">{item.email}</td>
                    <td className="px-6 py-4">{item.twilioNumber}</td>
                    <td className="px-6 py-4">{item.role}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[120px] block">
                          {viewPassword[item.id] && item.password
                            ? item.password
                            : '••••••••••••'}
                        </span>
                        <button className='cursor-pointer' onClick={() => togglePasswordView(item.id)}>
                          {viewPassword[item.id] ? (
                            <EyeSlashIcon className="w-4 h-4 text-gray-500" />
                          ) : (
                            <EyeIcon className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex gap-3 items-center">
                        <button
                          className="text-blue-600 hover:text-blue-800 transition cursor-pointer"
                          onClick={() => setEditUser(item)}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 transition cursor-pointer"
                          onClick={() => setDeleteUserId(item.id)}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (<AddUser setShowCreateModal={setShowCreateModal} setUsers={setUsers} setLoading={setLoading} />)}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <UpdateUser
            user={editUser}
            setEditUser={setEditUser}
            setUsers={setUsers}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>To delete this user, please enter your admin password:</p>
            <input
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              placeholder="Admin Password"
              className="mt-2 w-full border px-3 py-2 rounded"
            />
            {deleteError && (
              <p className="text-red-600 mt-2 text-sm">{deleteError}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="bg-gray-200 px-4 py-2 rounded"
                onClick={() => {
                  setDeleteUserId(null)
                  setAdminPassword('')
                  setDeleteError('')
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={handleDeleteUser}
                disabled={!adminPassword.trim()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
