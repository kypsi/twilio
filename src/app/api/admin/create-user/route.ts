// app/api/create-user/route.ts
import connectDB from '@/lib/mongo'
import { createUser } from '@/lib/mongo/CreateUser'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
    try {
        await connectDB()
        const body = await req.json()
        const { name, email, password, twilioNumber, role } = body

        if (!name || !email || !password || !twilioNumber || !role) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }
        // console.log("api", name, email, password, twilioNumber, role)
        const id = await createUser({ name, email, password, twilioNumber, role })
        return NextResponse.json({ message: 'User created', id }, { status: 200 })

    } catch (error) {
        console.error('[ADD_USER_ERROR]', error)
        return NextResponse.json({ message: 'Failed to create user' }, { status: 500 })
    }
}
