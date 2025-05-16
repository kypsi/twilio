import { NextRequest, NextResponse } from 'next/server'
// import { getUserById, deleteUserById } from '@/lib/airtable/airtable' // you'll create these
import { decrypt } from '@/lib/auth'
import jwt from 'jsonwebtoken'
import { deleteUserById, getUserByEmail, getUserById } from '@/lib/airtable/airtable'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_token'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, adminPassword, adminEmail } = body

    if (!userId || !adminPassword) {
      return NextResponse.json({ message: 'Missing userId or password' }, { status: 400 })
    }

    // // Extract token from cookie
    // const token = req.cookies.get('token')?.value

    // if (!token) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    // }

    // // Verify JWT
    // let adminPayload: any
    // try {
    //   adminPayload = jwt.verify(token, JWT_SECRET)
    // } catch {
    //   return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    // }

    // Fetch admin user details from DB by ID

    const adminUser = await getUserByEmail(adminEmail)
    const decryptedPassword = decrypt(adminUser?.password as string)

    
    
    if (!adminUser) {
        return NextResponse.json({ message: 'Admin user not found' }, { status: 401 })
    }
    
    if (decryptedPassword !== adminPassword) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // Now delete the user by ID
    const deleted = await deleteUserById(userId)

    if (!deleted) {
      return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 })
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })

  } catch (error) {
    console.error('[DELETE_USER_ERROR]', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
