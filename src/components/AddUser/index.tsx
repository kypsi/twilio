import { User } from '@/types/user'
import React, { useState } from 'react'
import { countries } from '../Keypad'

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countryCode, setCountryCode] = useState('+1')

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    const trimmed = Object.fromEntries(Object.entries(formData).map(([k, v]) => [k, v.trim()]))

    if (!trimmed.name) errors.name = 'Name is required'
    if (!trimmed.email) errors.email = 'Email is required'
    if (!trimmed.twilioNumber) errors.twilioNumber = 'Twilio number is required'

    if (!trimmed.password) {
      errors.password = 'Password is required'
    } else if (trimmed.password.length < 8 || !/\d/.test(trimmed.password) || !/[A-Za-z]/.test(trimmed.password)) {
      errors.password = 'Password must be at least 8 characters and include letters and numbers'
    }

    if (trimmed.password !== trimmed.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateUser = async () => {

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitMessage('')
    console.log("frontend", formData)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
          twilioNumber: `${countryCode}${formData.twilioNumber.trim()}`,
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
      const updatedUsers = await fetch('/api/admin/fetch-users').then(res => res.json())
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
    setFormErrors({ ...formErrors, [e.target.name]: '' })
  }

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') setShowPassword(!showPassword)
    else setShowConfirmPassword(!showConfirmPassword)
  }
  return (
    <div>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl w-[400px]">
          <h2 className="text-lg font-semibold mb-4">Create New User</h2>

          <div className="space-y-3">
            {(['name', 'email'] as FormField[]).map(field => (
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
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-[100px] border px-1 py-2 rounded bg-gray-100 text-sm"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    ({c.code}) {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="twilioNumber"
                placeholder="Phone Number"
                value={formData.twilioNumber}
                onChange={handleInputChange}
                className="flex-1 border px-1 py-2 rounded"
              />
            </div>
            {(['password', 'confirmPassword'] as FormField[]).map(field => (
              <div key={field} className="relative">
                <input
                  type={
                    field === 'password'
                      ? showPassword
                        ? 'text'
                        : 'password'
                      : showConfirmPassword
                        ? 'text'
                        : 'password'
                  }
                  name={field}
                  placeholder={field === 'password' ? 'Password' : 'Confirm Password'}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-sm text-gray-500"
                  onClick={() => togglePasswordVisibility(field as 'password' | 'confirmPassword')}
                >
                  {field === 'password'
                    ? showPassword ? 'Hide' : 'Show'
                    : showConfirmPassword ? 'Hide' : 'Show'}
                </button>
                {formErrors[field] && <p className="text-red-500 text-sm">{formErrors[field]}</p>}
              </div>
            ))}

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
