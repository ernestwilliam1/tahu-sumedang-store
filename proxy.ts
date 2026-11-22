import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-jwt-secret-change-in-production-32chars!')
const COOKIE = 'ts_session'

// Public routes: /, /katalog, /produk/*, /login, /register are freely accessible without authentication
const DASHBOARD_ROLES: Record<string, string[]> = {
  '/dashboard/owner': ['SUPERADMIN', 'OWNER'],
  '/dashboard/admin': ['SUPERADMIN', 'OWNER', 'ADMIN', 'STAFF'],
  '/admin': ['SUPERADMIN', 'OWNER', 'ADMIN', 'STAFF'],
  '/dashboard/supplier': ['SUPERADMIN', 'OWNER', 'SUPPLIER'],
  '/dashboard/finance': ['SUPERADMIN', 'OWNER', 'FINANCE'],
  '/profile': ['SUPERADMIN', 'OWNER', 'ADMIN', 'STAFF', 'SUPPLIER', 'FINANCE', 'CUSTOMER'],
}

function getLoginRedirect(req: NextRequest, error?: string): NextResponse {
  const returnUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)
  const loginUrl = new URL(`/login?callbackUrl=${returnUrl}${error ? `&error=${error}` : ''}`, req.url)
  return NextResponse.redirect(loginUrl)
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  // /dashboard/customer redirects to /profile; keep strictly protected
  if (path.startsWith('/dashboard/customer')) {
    const token = req.cookies.get(COOKIE)?.value
    if (!token) return getLoginRedirect(req)
    try {
      await jwtVerify(token, SECRET)
      return NextResponse.next()
    } catch {
      const res = getLoginRedirect(req)
      res.cookies.delete(COOKIE)
      return res
    }
  }

  const protectedPrefix = Object.keys(DASHBOARD_ROLES).find((p) => path === p || path.startsWith(p + '/'))
  // If not a protected prefix, allow freely (e.g. /, /katalog, /produk, etc.)
  if (!protectedPrefix) return NextResponse.next()

  const token = req.cookies.get(COOKIE)?.value
  if (!token) return getLoginRedirect(req)

  try {
    const { payload } = await jwtVerify(token, SECRET)
    const role = payload.role as string
    if (!DASHBOARD_ROLES[protectedPrefix].includes(role)) {
      return NextResponse.redirect(new URL('/login?error=forbidden', req.url))
    }
    return NextResponse.next()
  } catch {
    const res = getLoginRedirect(req)
    res.cookies.delete(COOKIE)
    return res
  }
}

export const config = { matcher: ['/admin/:path*', '/dashboard/:path*', '/profile/:path*'] }
