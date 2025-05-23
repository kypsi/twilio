import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongo'
import User from '@/lib/models/User'
import { decrypt } from '@/lib/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_token'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string, email: string }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, adminPassword } = body

    if (!userId || !adminPassword) {
      return NextResponse.json({ message: 'Missing userId or password' }, { status: 400 })
    }

    await connectDB()

    // Fetch admin user from MongoDB using email from token
    const adminUser = await User.findOne({ email: decoded.email })

    if (!adminUser) {
      return NextResponse.json({ message: 'Admin user not found' }, { status: 401 })
    }

    const decryptedPassword = decrypt(adminUser.password)

    if (decryptedPassword !== adminPassword) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // Delete user by ID
    const deletedUser = await User.findByIdAndDelete(userId)

    if (!deletedUser) {
      return NextResponse.json({ message: 'User not found or already deleted' }, { status: 404 })
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })

  } catch (error) {
    console.error('[DELETE_USER_ERROR]', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
