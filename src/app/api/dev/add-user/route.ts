import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/airtable'

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { name, email, password, twilioNumber, role } = body

    if (!name || !email || !password || !twilioNumber || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const id = await createUser({ name, email, password, twilioNumber, role })
    return NextResponse.json({ message: 'User created', id }, { status: 200 })

  } catch (error) {
    console.error('[ADD_USER_ERROR]', error)
    return NextResponse.json({ message: 'Failed to create user' }, { status: 500 })
  }
}
