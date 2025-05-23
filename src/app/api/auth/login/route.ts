// import { NextRequest, NextResponse } from 'next/server'
// import { getUserByEmail } from '@/lib/airtable/airtable'
// import { serialize } from 'cookie'
// import jwt from 'jsonwebtoken'
// import { decrypt } from '@/lib/auth'
// // import bcrypt from 'bcryptjs'

// const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_token'

// export async function POST(req: NextRequest) {
//     const body = await req.json()
//     const { email, password } = body

//     const user = await getUserByEmail(email)

//     if (!user) {
//         return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
//     }


//     //old using bycrypt
//     // const passwordMatch = await bcrypt.compare(password, user.password as string)

//     // if (!passwordMatch) {
//     //     return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
//     // }

//     // const token = jwt.sign(
//     //     { userId: user.id, email: user.email, twilioNumber: user.twilioNumber, name: user.name, role: user.role },
//     //     JWT_SECRET,
//     //     { expiresIn: '7d' }
//     // )


//     //using AES encryption
//     try {
//         const decryptedPassword = decrypt(user.password as string)

//         if (decryptedPassword !== password) {
//             return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
//         }

//         const token = jwt.sign(
//             {
//                 userId: user.id,
//                 email: user.email,
//                 twilioNumber: user.twilioNumber,
//                 name: user.name,
//                 role: user.role,
//             },
//             JWT_SECRET,
//             { expiresIn: '7d' }
//         )

//         const response = NextResponse.json({ message: 'Login successful' })

//         response.headers.set(
//             'Set-Cookie',
//             serialize('token', token, {
//                 httpOnly: true,
//                 secure: process.env.NODE_ENV === 'production',
//                 path: '/',
//                 maxAge: 60 * 60 * 24 * 7,
//             })
//         )

//         return response
//     } catch (err) {
//         console.error('Decryption error:', err)
//         return NextResponse.json({ message: 'Something went wrong' }, { status: 500 })
//     }
// }



import { NextRequest, NextResponse } from 'next/server'
import { serialize } from 'cookie'
import jwt from 'jsonwebtoken'
import { decrypt } from '@/lib/auth'
import connectDB from '@/lib/mongo'
import User from '@/lib/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_token'

export async function POST(req: NextRequest) {
    await connectDB() // Ensure the DB is connected

    const body = await req.json()
    const { email, password } = body

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
        }

        const decryptedPassword = decrypt(user.password)

        if (decryptedPassword !== password) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                twilioNumber: user.twilioNumber,
                name: user.name,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        const response = NextResponse.json({ message: 'Login successful' })

        response.headers.set(
            'Set-Cookie',
            serialize('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            })
        )

        return response
    } catch (err) {
        console.error('Login error:', err)
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 })
    }
}
