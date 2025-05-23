// app/api/admin/fetch-users/route.ts

import User from '@/lib/models/User'
import connectDB from '@/lib/mongo'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_token'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 })
    }

    await connectDB()

    const users = await User.find({}, { password: 0 }) // Exclude password

    return NextResponse.json(
      users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        twilioNumber: user.twilioNumber,
        role: user.role,
      }))
    )
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token or failed to fetch users', error }, { status: 401 })
  }
}
