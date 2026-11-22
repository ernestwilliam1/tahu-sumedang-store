'use server'

import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, signSession, setSessionCookie, clearSessionCookie, getSession } from '@/lib/auth'
import type { Role } from '@/lib/auth'

interface AuthResult { success: boolean; message: string }

// Demo OTP store — in-memory (resets on restart, fine for college demo). In production use Redis/DB.
const otpStore = globalThis as unknown as { __otp?: Map<string, string> }
if (!otpStore.__otp) otpStore.__otp = new Map<string, string>()
const OTP_MAP: Map<string, string> = otpStore.__otp

// ponytail: rate limit in-memory, reset tiap instance lambda. Pindah ke Redis
// (Upstash) kalau butuh batas yang konsisten lintas region.
const limitStore = globalThis as unknown as { __loginAttempts?: Map<string, { count: number; resetAt: number }> }
if (!limitStore.__loginAttempts) limitStore.__loginAttempts = new Map()
const LOGIN_ATTEMPTS: Map<string, { count: number; resetAt: number }> = limitStore.__loginAttempts
const LOGIN_MAX = 8
const LOGIN_WINDOW_MS = 10 * 60 * 1000

function tooManyAttempts(key: string): boolean {
  const now = Date.now()
  const entry = LOGIN_ATTEMPTS.get(key)
  if (!entry || entry.resetAt < now) return false
  return entry.count >= LOGIN_MAX
}

function recordFailure(key: string): void {
  const now = Date.now()
  const entry = LOGIN_ATTEMPTS.get(key)
  if (!entry || entry.resetAt < now) {
    LOGIN_ATTEMPTS.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return
  }
  entry.count++
}

export async function registerAction(formData: FormData): Promise<AuthResult> {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  if (!name || !email || !password) return { success: false, message: 'Lengkapi semua field.' }
  if (password.length < 6) return { success: false, message: 'Password minimal 6 karakter.' }
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { success: false, message: 'Email sudah terdaftar.' }
  const role: Role = 'CUSTOMER'
  const user = await prisma.user.create({ data: { name, email, password: hashPassword(password), role } })
  const token = await signSession({ userId: user.id, email: user.email, name: user.name, role: user.role as Role })
  await setSessionCookie(token)
  return { success: true, message: 'Registrasi berhasil.' }
}

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  if (!email || !password) return { success: false, message: 'Email dan password wajib diisi.' }
  if (tooManyAttempts(email)) {
    return { success: false, message: 'Terlalu banyak percobaan login. Coba lagi dalam 10 menit.' }
  }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !verifyPassword(password, user.password)) {
    recordFailure(email)
    return { success: false, message: 'Email atau password salah.' }
  }
  LOGIN_ATTEMPTS.delete(email)
  const token = await signSession({ userId: user.id, email: user.email, name: user.name, role: user.role as Role })
  await setSessionCookie(token)
  return { success: true, message: 'Login berhasil.' }
}

export async function requestPhoneOtpAction(phone: string): Promise<AuthResult & { code?: string }> {
  const p = phone.trim()
  if (!p || p.length < 9) return { success: false, message: 'Nomor HP tidak valid.' }
  const code = String(Math.floor(100000 + Math.random() * 900000))
  OTP_MAP.set(p, code)
  // Demo: return code so UI can show it. In production send via SMS gateway.
  return { success: true, message: `Kode OTP: ${code} (demo)`, code }
}

export async function verifyPhoneOtpAction(formData: FormData): Promise<AuthResult> {
  const phone = (formData.get('phone') as string)?.trim()
  const code = (formData.get('code') as string)?.trim()
  const name = (formData.get('name') as string)?.trim() || 'Pelanggan'
  if (!phone || !code) return { success: false, message: 'Nomor dan kode OTP wajib.' }
  const expected = OTP_MAP.get(phone)
  if (!expected || expected !== code) return { success: false, message: 'Kode OTP salah atau kadaluarsa.' }
  OTP_MAP.delete(phone)
  // Find by phone or create CUSTOMER
  let user = await prisma.user.findFirst({ where: { phone } })
  if (!user) {
    const email = `phone_${phone.replace(/\D/g, '')}@phone.local`
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) user = existingEmail
    else user = await prisma.user.create({ data: { name, email, phone, password: hashPassword(code + phone), role: 'CUSTOMER' } })
  }
  const token = await signSession({ userId: user.id, email: user.email, name: user.name, role: user.role as Role })
  await setSessionCookie(token)
  return { success: true, message: 'Login via HP berhasil.' }
}

export async function socialLoginAction(provider: string): Promise<AuthResult> {
  const p = provider.toLowerCase()
  if (!['google', 'facebook'].includes(p)) return { success: false, message: 'Provider tidak didukung.' }
  // Demo mock: create/find a customer for this provider
  const email = `demo_${p}@social.local`
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: { name: p === 'google' ? 'Google User' : 'Facebook User', email, password: hashPassword(p + '_demo'), role: 'CUSTOMER' },
    })
  }
  const token = await signSession({ userId: user.id, email: user.email, name: user.name, role: user.role as Role })
  await setSessionCookie(token)
  return { success: true, message: `Login via ${p} berhasil (demo).` }
}

export async function updateProfileAction(formData: FormData): Promise<AuthResult> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Belum login.' }
  const name = (formData.get('name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim() || null
  const address = (formData.get('address') as string)?.trim() || null
  const city = (formData.get('city') as string)?.trim() || null
  if (!name) return { success: false, message: 'Nama wajib diisi.' }
  const updated = await prisma.user.update({ where: { id: session.userId }, data: { name, phone, address, city } })
  const token = await signSession({ userId: updated.id, email: updated.email, name: updated.name, role: updated.role as Role })
  await setSessionCookie(token)
  return { success: true, message: 'Profil diperbarui.' }
}

export async function logoutAction(): Promise<AuthResult> {
  await clearSessionCookie()
  return { success: true, message: 'Keluar berhasil.' }
}

export async function getSessionAction() {
  return getSession()
}

export async function resetPasswordAction(formData: FormData): Promise<AuthResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const newPassword = formData.get('newPassword') as string
  const confirm = formData.get('confirmPassword') as string
  if (!email || !newPassword || !confirm) return { success: false, message: 'Lengkapi email dan password baru.' }
  if (newPassword.length < 6) return { success: false, message: 'Password minimal 6 karakter.' }
  if (newPassword !== confirm) return { success: false, message: 'Konfirmasi password tidak cocok.' }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { success: false, message: 'Email tidak ditemukan.' }
  await prisma.user.update({ where: { id: user.id }, data: { password: hashPassword(newPassword) } })
  return { success: true, message: 'Password berhasil direset. Silakan login dengan password baru.' }
}
