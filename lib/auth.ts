import { hashSync, compareSync } from 'bcryptjs'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-only-jwt-secret-change-in-production-32chars!'
)
const COOKIE_NAME = 'ts_session'
const JWT_EXPIRES = '7d'

export type Role = 'SUPERADMIN' | 'OWNER' | 'ADMIN' | 'STAFF' | 'SUPPLIER' | 'FINANCE' | 'CUSTOMER'

export function hashPassword(plain: string): string {
  return hashSync(plain, 10)
}

export function verifyPassword(plain: string, hash: string): boolean {
  return compareSync(plain, hash)
}

export interface SessionPayload extends JWTPayload {
  userId: number
  email: string
  name: string
  role: Role
}

export async function signSession(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
  return await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES)
    .sign(JWT_SECRET)
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies()
  store.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  return prisma.user.findUnique({ where: { id: session.userId } })
}

export async function requireSession(): Promise<SessionPayload> {
  const s = await getSession()
  if (!s) throw new Error('Unauthorized')
  return s
}
