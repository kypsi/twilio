// lib/mongo/createUser.ts
import User from '@/lib/models/User'
import { encrypt } from '../auth'

export async function createUser({
    name,
    email,
    password,
    twilioNumber,
    role,
}: {
    name: string
    email: string
    password: string
    twilioNumber: string
    role: string
}) {
    const encryptedPassword = encrypt(password)

    const user = await User.create({
        name,
        email,
        password: encryptedPassword,
        twilioNumber,
        role,
        isAdmin: role === 'admin',
    })

    return user._id.toString()
}