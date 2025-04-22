// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { getUserByEmail } from '@/lib/airtable'
import { serialize } from 'cookie'

const JWT_SECRET = process.env.JWT_SECRET || 'somesecret'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body
  const user = await getUserByEmail(email)

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, twilioNumber: user.twilioNumber },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.setHeader('Set-Cookie', serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }))

  res.status(200).json({ message: 'Login successful' })
}
