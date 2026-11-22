import { NextResponse } from 'next/server'
import { expireOverdueOrders } from '@/lib/actions'

export const dynamic = 'force-dynamic'

// Vercel Cron mengirim `Authorization: Bearer $CRON_SECRET`.
// Tanpa CRON_SECRET (dev lokal) route terbuka — jangan biarkan kosong di produksi.
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const r = await expireOverdueOrders()
  return NextResponse.json(r)
}
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const r = await expireOverdueOrders()
  return NextResponse.json(r)
}
