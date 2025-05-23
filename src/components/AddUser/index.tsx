import { User } from '@/types/user'
import React, { useState } from 'react'

interface AddUserProps {
  setShowCreateModal: (show: boolean) => void
  setUsers: (users: User[]) => void
  setLoading: (loading: boolean) => void
}

const AddUser: React.FC<AddUserProps> = ({ setShowCreateModal, setUsers, setLoading }) => {
  type FormField = 'name' | 'email' | 'twilioNumber' | 'password' | 'confirmPassword' | 'role';

  const [formData, setFormData] = useState<Record<FormField, string>>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    twilioNumber: '',
    role: 'user',
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleCreateUser = async () => {
    const errors: { [key: string]: string } = {}
    if (!formData.name) errors.name = 'Name is required'
    if (!formData.email) errors.email = 'Email is required'
    if (!formData.password) errors.password = 'Password is required'
    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = 'Passwords do not match'
    if (!formData.twilioNumber) errors.twilioNumber = 'Twilio number is required'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const res = await fetch('/api/dev/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          twilioNumber: formData.twilioNumber,
          role: formData.role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create user')
      }

      setSubmitMessage('User created successfully')
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        twilioNumber: '',
        role: 'user',
      })

      setShowCreateModal(false)
      setLoading(true)
      const updatedUsers = await fetch('/api/admin/users').then(res => res.json())
      setUsers(updatedUsers)
      setLoading(false)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitMessage(err.message);
      } else {
        setSubmitMessage('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setFormErrors({ ...formErrors, [e.target.name]: '' }) // clear field error on change
  }
  return (
    <div>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl w-[400px]">
          <h2 className="text-lg font-semibold mb-4">Create New User</h2>

          <div className="space-y-3">
            {(['name', 'email', 'twilioNumber'] as FormField[]).map(field => (
              <div key={field}>
                <input
                  type="text"
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                />
                {formErrors[field] && <p className="text-red-500 text-sm">{formErrors[field]}</p>}
              </div>
            ))}

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
              {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>
              )}
            </div>

            <div>
              Role:
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {submitMessage && (
            <p className="text-sm mt-2 text-red-500">{submitMessage}</p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => {
                setShowCreateModal(false)
                setFormErrors({})
                setSubmitMessage('')
              }}
              className="text-sm text-gray-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateUser}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddUser
