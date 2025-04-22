import { parse } from 'cookie'
import { verifyToken } from './auth'
import { NextRequest } from 'next/server'

export function getUserFromRequest(req: NextRequest) {
  const cookies = parse(req.headers.get('cookie') || '')
  const token = cookies.token
  if (!token) return null

  return verifyToken(token)
}
