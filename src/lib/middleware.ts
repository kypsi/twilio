// lib/middleware.ts
import { parse } from 'cookie'
import { verifyToken } from './auth'

export function getUserFromRequest(req : any) {
  const cookies = parse(req.headers.cookie || '')
  const token = cookies.token
  if (!token) return null

  return verifyToken(token)
}
