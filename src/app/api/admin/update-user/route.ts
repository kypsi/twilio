import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongo'
import User from '@/lib/models/User'
import { encrypt } from '@/lib/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_token'

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string }
    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 })
    }

    const body = await request.json()
    const { id, name, email, twilioNumber, role, password } = body

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    await connectDB()

    // Prepare update fields (excluding password)
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (twilioNumber) updateData.twilioNumber = twilioNumber
    if (role) updateData.role = role

    // If password provided, encrypt and add it to update
    if (password && password.trim() !== '') {
      updateData.password = encrypt(password)
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true })

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      twilioNumber: updatedUser.twilioNumber,
      role: updatedUser.role,
    })
  } catch (err) {
    console.error('Error updating user:', err)
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 })
  }
}
