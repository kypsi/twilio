import { NextRequest, NextResponse } from 'next/server'
import { updateUser, changeUserPassword } from '@/lib/airtable/airtable'
import { encrypt } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params
        const body = await req.json()

        const { name, email, twilioNumber, role, password } = body

        // Step 1: Update user details (except password)
        await updateUser(id, {
            name,
            email,
            twilioNumber,
            role,
        })

        // Step 2: Optionally update password if provided
        if (password && password.trim() !== '') {
            //   const encryptedPassword = encrypt(password)
            const encryptedPassword = encrypt(password)
            await changeUserPassword(id, encryptedPassword)
        }

        // Step 3: Return updated user
        const updatedUser = {
            id,
            name,
            email,
            twilioNumber,
            role,
        }

        return NextResponse.json(updatedUser)
    } catch (err) {
        console.error('Error updating user:', err)
        return NextResponse.json({ message: 'Failed to update user' }, { status: 500 })
    }
}
