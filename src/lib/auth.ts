import crypto from 'crypto'
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'somesecret'

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

const algorithm = 'aes-256-cbc'
const key = crypto.createHash('sha256').update(String(process.env.ENCRYPTION_SECRET)).digest('base64').substr(0, 32)
const iv = crypto.randomBytes(16)

export function encrypt(text: string) {
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}` // Store IV with ciphertext
}

export function decrypt(encryptedText: string) {
  const [ivHex, encrypted] = encryptedText.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
