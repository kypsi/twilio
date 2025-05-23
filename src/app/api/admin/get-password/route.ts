// app/api/admin/users/password/route.ts

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongo'
import User from '@/lib/models/User'
import { decrypt } from '@/lib/auth' // Only decryption is still imported

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_token'

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { role: string }

        if (decoded.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 })
        }

        const { id } = await req.json()
        if (!id) {
            return NextResponse.json({ message: 'Missing user ID in request body' }, { status: 400 })
        }

        await connectDB()
        const user = await User.findById(id)

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        const decryptedPassword = decrypt(user.password as string)

        return NextResponse.json({ id: user._id, password: decryptedPassword })
    } catch (err) {
        return NextResponse.json({ message: 'Invalid token or error', error: err }, { status: 401 })
    }
}
