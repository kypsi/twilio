// src/app/api/auth/me/route.ts
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'somesecret'

export async function GET() {
  const cookieStore = cookies()
  const token = (await cookieStore).get('token')?.value

  if (!token) {
    return new Response(JSON.stringify({ user: null }), { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return new Response(JSON.stringify({ user: decoded }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.log("Error in api/auth/me:", err);
    return new Response(JSON.stringify({ user: null }), { status: 401 })
  }
}
