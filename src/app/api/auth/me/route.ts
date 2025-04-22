// pages/api/auth/me.ts
import { getUserFromRequest } from '@/lib/middleware'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req)
  if (!user) return res.status(401).json({ user: null })

  res.status(200).json({ user })
}
