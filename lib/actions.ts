'use server'

import { prisma } from '@/lib/prisma'
import { generateOrderNumber, formatRupiah } from '@/lib/utils'
import { getSession, hashPassword } from '@/lib/auth'
import { generateQrisPayload } from '@/lib/payment'
import { savePaymentProof } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

export interface CheckoutPayload {
  customerName: string
  customerPhone: string
  customerEmail?: string
  address: string
  city: string
  postalCode?: string
  notes?: string
  shippingMethod: string
  shippingCost: number
  paymentMethod: string
  discount: number
  items: { productId: number; quantity: number; price: number; variant?: string }[]
}

interface ActionResult { success: boolean; message: string; orderNumber?: string; vaNumber?: string; qrisPayload?: string; paymentRef?: string }

async function requireInventoryRole(): Promise<boolean> {
  const s = await getSession()
  if (!s) return false
  return ['SUPERADMIN', 'OWNER', 'ADMIN', 'STAFF'].includes(s.role)
}
async function requireOrderManageRole(): Promise<boolean> {
  const s = await getSession()
  if (!s) return false
  return ['SUPERADMIN', 'OWNER', 'ADMIN', 'STAFF', 'FINANCE'].includes(s.role)
}
async function requireOwner(): Promise<boolean> {
  const s = await getSession()
  if (!s) return false
  return ['SUPERADMIN', 'OWNER'].includes(s.role)
}
async function requireFinance(): Promise<boolean> {
  const s = await getSession()
  if (!s) return false
  return ['SUPERADMIN', 'OWNER', 'FINANCE'].includes(s.role)
}

const VOUCHERS: Record<string, { type: 'percent' | 'fixed'; value: number; minOrder?: number }> = {
  TAHU10: { type: 'percent', value: 10 },
  SUMEDANG20: { type: 'fixed', value: 20000, minOrder: 50000 },
  GRATISONGKIR: { type: 'fixed', value: 15000, minOrder: 30000 },
}

export async function getVouchers(): Promise<Record<string, { type: 'percent' | 'fixed'; value: number; minOrder?: number }>> {
  return VOUCHERS
}

export type UserProfileData = {
  name: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  postalCode?: string | null
}

export async function getUserProfile(): Promise<UserProfileData | null> {
  try {
    const session = await getSession()
    if (!session || !session.userId) return null

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
      },
    })
    if (!user) return null

    // If postalCode exists in recent orders for this user, grab the latest one as default
    const latestOrder = await prisma.order.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      select: { postalCode: true },
    })

    return {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: latestOrder?.postalCode || null,
    }
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') {
      return null
    }
    console.error('getUserProfile error:', err)
    return null
  }
}

export async function validateVoucher(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string }> {
  const v = VOUCHERS[code.toUpperCase().trim()]
  if (!v) return { valid: false, discount: 0, message: 'Kode tidak ditemukan.' }
  if (v.minOrder && subtotal < v.minOrder) return { valid: false, discount: 0, message: `Minimal belanja ${formatRupiah(v.minOrder)}` }
  const discount = v.type === 'percent' ? Math.round(subtotal * v.value / 100) : v.value
  return { valid: true, discount, message: `Voucher ${code.toUpperCase()} aktif` }
}

async function logActivity(role: string, action: string, message: string) {
  try { await prisma.activityLog.create({ data: { role, action, message } }) } catch { }
}

export async function createOrder(data: CheckoutPayload): Promise<ActionResult> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, message: 'Akses ditolak: Anda harus masuk ke akun Pelanggan terlebih dahulu untuk menyelesaikan pesanan.' }
    }
    if (session.role !== 'CUSTOMER') {
      return { success: false, message: 'Akses dibatasi: hanya akun Pelanggan (CUSTOMER) yang dapat melakukan pembelian. Akun operasional tidak diperbolehkan bertransaksi.' }
    }
    if (!data.customerName || !data.customerPhone || !data.address || data.items.length === 0) return { success: false, message: 'Lengkapi semua data pengiriman dan keranjang.' }
    const validMethods = ['COD', 'TRANSFER_BCA', 'QRIS', 'VA_BCA']
    if (!validMethods.includes(data.paymentMethod)) return { success: false, message: 'Metode pembayaran tidak valid.' }
    const subtotal = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const totalAmount = Math.max(0, subtotal + data.shippingCost - data.discount)
    const orderNumber = generateOrderNumber()
    let paymentStatus = 'UNPAID'
    let orderStatus = 'PENDING'
    let vaNumber: string | null = null
    let qrisPayload: string | null = null
    let paymentRef: string | null = null
    let expiresAt: Date | null = null
    if (data.paymentMethod === 'TRANSFER_BCA' || data.paymentMethod === 'VA_BCA') {
      paymentStatus = 'UNPAID'
      orderStatus = 'AWAITING_PAYMENT'
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      paymentRef = 'BCA: 5020348994 a.n. ERNEST WILLIAM IMANUEL HU'
    } else if (data.paymentMethod === 'QRIS') {
      paymentStatus = 'UNPAID'
      orderStatus = 'AWAITING_PAYMENT'
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      qrisPayload = generateQrisPayload(orderNumber, totalAmount)
      paymentRef = qrisPayload
    } else if (data.paymentMethod === 'COD') {
      paymentStatus = 'UNPAID'
      orderStatus = 'PROCESSING'
      paymentRef = 'COD'
    }
    await prisma.$transaction(async (tx) => {
      // Server-side stock validation prevents negative inventory
      for (const item of data.items) {
        const prod = await tx.product.findUnique({ where: { id: item.productId }, select: { stock: true, name: true } })
        if (!prod) throw new Error(`Produk #${item.productId} tidak ditemukan.`)
        if (prod.stock < item.quantity) throw new Error(`Stok ${prod.name} tidak mencukupi (sisa ${prod.stock}).`)
      }
      await tx.order.create({
        data: {
          orderNumber, userId: session?.userId ?? null, customerName: data.customerName, customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null, address: data.address, city: data.city, postalCode: data.postalCode || null,
          notes: data.notes || null, shippingMethod: data.shippingMethod, shippingCost: data.shippingCost,
          paymentMethod: data.paymentMethod, paymentStatus, paymentRef, vaNumber, qrisPayload, expiresAt,
          subtotal, discount: data.discount, totalAmount, status: orderStatus,
          items: { create: data.items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price, variant: i.variant || null })) },
        },
      })
      for (const item of data.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } } })
    })
    revalidateOrderFlow()
    await logActivity(session.role, 'Pesanan Baru', `${session.name} — ${orderNumber} · ${data.paymentMethod} · ${formatRupiah(totalAmount)}`)
    return { success: true, message: 'Pesanan dibuat.', orderNumber, vaNumber: vaNumber ?? undefined, qrisPayload: qrisPayload ?? undefined, paymentRef: paymentRef ?? undefined }
  } catch (err) { const msg = err instanceof Error ? err.message : 'Gagal memproses pesanan.'; console.error('createOrder failed:', err); return { success: false, message: msg } }
}

function revalidateCatalogAndInventory() {
  revalidatePath('/')
  revalidatePath('/katalog')
  revalidatePath('/admin')
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/owner')
  revalidatePath('/dashboard/finance')
}

function revalidateOrderFlow() {
  revalidatePath('/')
  revalidatePath('/katalog')
  revalidatePath('/profile')
  revalidatePath('/admin')
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/owner')
  revalidatePath('/dashboard/finance')
}

export async function addProduct(formData: FormData): Promise<ActionResult> {
  if (!(await requireInventoryRole())) return { success: false, message: 'Akses ditolak.' }
  try {
    const name = formData.get('name') as string; const price = parseInt(formData.get('price') as string, 10); const stock = parseInt(formData.get('stock') as string, 10)
    const category = (formData.get('category') as string) || 'Tahu Goreng'; const description = (formData.get('description') as string) || ''; const image = (formData.get('image') as string) || ''
    if (!name || isNaN(price) || isNaN(stock)) return { success: false, message: 'Isi semua kolom wajib.' }
    await prisma.product.create({ data: { name, price, stock, category, description, image: image.trim() || null } })
    revalidateCatalogAndInventory()
    { const s = await getSession(); if (s) await logActivity(s.role, 'Produk Ditambahkan', `${name} · ${category} · ${price.toLocaleString('id-ID')} · stok ${stock}`) }
    return { success: true, message: 'Produk ditambahkan.' }
  } catch (err) { console.error('addProduct failed:', err); return { success: false, message: 'Gagal menambahkan produk.' } }
}

export async function updateStock(productId: number, newStock: number): Promise<ActionResult> {
  if (!(await requireInventoryRole())) return { success: false, message: 'Akses ditolak.' }
  try { await prisma.product.update({ where: { id: productId }, data: { stock: Math.max(0, newStock) } }); revalidateCatalogAndInventory(); { const s = await getSession(); if (s) await logActivity(s.role, 'Stok Diperbarui', `Produk #${productId} → stok ${newStock}`) } return { success: true, message: 'Stok diperbarui.' } } catch (err) { console.error('updateStock failed:', err); return { success: false, message: 'Gagal memperbarui stok.' } }
}

export async function deleteProduct(productId: number): Promise<ActionResult> {
  if (!(await requireInventoryRole())) return { success: false, message: 'Akses ditolak.' }
  try { await prisma.product.delete({ where: { id: productId } }); revalidateCatalogAndInventory(); { const s = await getSession(); if (s) await logActivity(s.role, 'Produk Dihapus', `Produk #${productId} dihapus`) } return { success: true, message: 'Produk dihapus.' } } catch (err) { console.error('deleteProduct failed:', err); return { success: false, message: 'Gagal menghapus produk.' } }
}

export async function updateProduct(productId: number, data: { name?: string; price?: number; description?: string; category?: string; image?: string }): Promise<ActionResult> {
  if (!(await requireInventoryRole())) return { success: false, message: 'Akses ditolak.' }
  try { await prisma.product.update({ where: { id: productId }, data }); revalidateCatalogAndInventory(); { const s = await getSession(); if (s) await logActivity(s.role, 'Produk Diperbarui', `Produk #${productId} diperbarui`) } return { success: true, message: 'Produk diperbarui.' } } catch (err) { console.error('updateProduct failed:', err); return { success: false, message: 'Gagal memperbarui produk.' } }
}

export async function updateOrderStatus(orderId: number, status: string): Promise<ActionResult> {
  if (!(await requireOrderManageRole())) return { success: false, message: 'Akses ditolak.' }
  try { await prisma.order.update({ where: { id: orderId }, data: { status } }); revalidateOrderFlow(); { const s = await getSession(); if (s) await logActivity(s.role, 'Status Pesanan Diubah', `Order #${orderId} → ${status}`) } return { success: true, message: 'Status diperbarui.' } } catch (err) { console.error('updateOrderStatus failed:', err); return { success: false, message: 'Gagal memperbarui status.' } }
}

export async function confirmOrderPayment(orderNumber: string): Promise<ActionResult> {
  try {
    const session = await getSession()
    const order = await prisma.order.findUnique({ where: { orderNumber } })
    if (!order) return { success: false, message: 'Pesanan tidak ditemukan.' }
    if (order.paymentStatus === 'PAID') {
      return { success: true, message: 'Pembayaran sudah terverifikasi lunas.' }
    }
    // RBAC: only order owner (CUSTOMER), FINANCE, OWNER/SUPERADMIN may settle. Prevent arbitrary PAID forgery.
    if (session) {
      const isOwner = ['SUPERADMIN', 'OWNER', 'FINANCE'].includes(session.role)
      const isOrderOwner = order.userId !== null && order.userId === session.userId
      const isCodOwner = order.paymentMethod === 'COD' && isOrderOwner
      if (!isOwner && !isOrderOwner && !isCodOwner) {
        // still allow logged-in customer settling own order; otherwise block guest bulk settlement abuse
        if (session.role !== 'CUSTOMER') return { success: false, message: 'Akses ditolak.' }
        if (order.userId !== null && order.userId !== session.userId) return { success: false, message: 'Pesanan bukan milik Anda.' }
      }
    } else {
      // guest: only allow if order was guest order (userId null) — rate limited by existence of orderNumber
      if (order.userId !== null) return { success: false, message: 'Masuk untuk verifikasi pesanan ini.' }
    }
    // Automated settlement — ledger is the Order itself (paymentStatus → PAID), finance dashboard aggregates paid orders in real-time
    await prisma.order.update({
      where: { orderNumber },
      data: {
        paymentStatus: 'PAID',
        status: order.status === 'AWAITING_PAYMENT' || order.status === 'PENDING' ? 'PROCESSING' : order.status,
        paidAt: new Date(),
      },
    })
    revalidateOrderFlow()
    { const s = await getSession(); if (s) await logActivity(s.role, 'Pembayaran Diverifikasi', `${orderNumber} lunas — ${order.paymentMethod} · ${order.totalAmount.toLocaleString('id-ID')}`); else await logActivity('CUSTOMER', 'Pembayaran Diverifikasi', `${orderNumber} lunas — ${order.paymentMethod} · ${order.totalAmount.toLocaleString('id-ID')}`) }
    return { success: true, message: 'Pembayaran berhasil — dana masuk ke Rekening Operasional BCA 8880123456 a.n. Tahu Sumedang Official. Pesanan diproses.' }
  } catch (err) {
    console.error('confirmOrderPayment error:', err)
    return { success: false, message: 'Gagal mengonfirmasi status pembayaran.' }
  }
}

export async function uploadPaymentProof(formData: FormData): Promise<ActionResult & { paymentProofUrl?: string }> {
  try {
    const session = await getSession()
    const orderNumber = formData.get('orderNumber') as string
    const file = formData.get('file') as File | null

    if (!orderNumber) {
      return { success: false, message: 'Nomor pesanan tidak valid.' }
    }
    if (!file || file.size === 0) {
      return { success: false, message: 'Pilih file bukti pembayaran (gambar).' }
    }

    if (!file.type.startsWith('image/')) {
      return { success: false, message: 'Format file harus berupa gambar (JPG, PNG, WebP).' }
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, message: 'Ukuran gambar maksimal 10MB.' }
    }

    const order = await prisma.order.findUnique({ where: { orderNumber } })
    if (!order) return { success: false, message: 'Pesanan tidak ditemukan.' }

    // Authorization check
    if (session) {
      if (session.role === 'CUSTOMER' && order.userId && order.userId !== session.userId) {
        return { success: false, message: 'Akses ditolak: pesanan bukan milik akun Anda.' }
      }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg'
    const fileName = `proof-${orderNumber}-${Date.now()}.${safeExt}`

    const paymentProofUrl = await savePaymentProof(fileName, buffer, file.type)

    await prisma.order.update({
      where: { orderNumber },
      data: {
        paymentProofUrl,
        paymentStatus: 'WAITING_VERIFICATION',
        status: 'AWAITING_PAYMENT',
      },
    })

    revalidateOrderFlow()

    const roleName = session?.role || 'CUSTOMER'
    await logActivity(
      roleName,
      'Bukti Bayar Diunggah',
      `${orderNumber} mengunggah bukti bayar (${file.name}) · Menunggu verifikasi Finance`
    )

    return {
      success: true,
      message: 'Bukti transfer berhasil diunggah! Tim Finance kami akan segera memverifikasi.',
      paymentProofUrl,
    }
  } catch (err) {
    console.error('uploadPaymentProof failed:', err)
    return { success: false, message: 'Gagal mengunggah bukti transfer.' }
  }
}

export async function approvePayment(orderNumber: string): Promise<ActionResult> {
  try {
    const session = await getSession()
    if (!session || !['SUPERADMIN', 'OWNER', 'FINANCE', 'ADMIN'].includes(session.role)) {
      return { success: false, message: 'Akses ditolak: hanya Admin/Finance yang dapat memverifikasi pembayaran.' }
    }

    const order = await prisma.order.findUnique({ where: { orderNumber } })
    if (!order) return { success: false, message: 'Pesanan tidak ditemukan.' }
    if (order.paymentStatus === 'PAID') {
      return { success: true, message: 'Pesanan ini sudah berstatus PAID.' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { orderNumber },
        data: {
          paymentStatus: 'PAID',
          status: 'PROCESSING',
          paidAt: new Date(),
        },
      })
    })

    revalidateOrderFlow()
    await logActivity(
      session.role,
      'Verifikasi Lunas (Approved)',
      `${session.name} menyetujui pembayaran ${orderNumber} (${order.paymentMethod} · ${formatRupiah(order.totalAmount)})`
    )

    return { success: true, message: `Pembayaran ${orderNumber} berhasil diverifikasi LUNAS.` }
  } catch (err) {
    console.error('approvePayment failed:', err)
    return { success: false, message: 'Gagal menyetujui pembayaran.' }
  }
}

export async function rejectPayment(orderNumber: string, reason?: string): Promise<ActionResult> {
  try {
    const session = await getSession()
    if (!session || !['SUPERADMIN', 'OWNER', 'FINANCE', 'ADMIN'].includes(session.role)) {
      return { success: false, message: 'Akses ditolak: hanya Admin/Finance yang dapat menolak pembayaran.' }
    }

    const order = await prisma.order.findUnique({ where: { orderNumber } })
    if (!order) return { success: false, message: 'Pesanan tidak ditemukan.' }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { orderNumber },
        data: {
          paymentStatus: 'REJECTED',
        },
      })
    })

    revalidateOrderFlow()
    await logActivity(
      session.role,
      'Pembayaran Ditolak',
      `${session.name} menolak bukti bayar ${orderNumber}${reason ? ` · Alasan: ${reason}` : ''}`
    )

    return { success: true, message: `Pembayaran ${orderNumber} ditolak.` }
  } catch (err) {
    console.error('rejectPayment failed:', err)
    return { success: false, message: 'Gagal menolak pembayaran.' }
  }
}

export async function getOrderPaymentStatus(orderNumber: string): Promise<{
  success: boolean
  paymentStatus?: string
  status?: string
  paidAt?: Date | null
}> {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: { paymentStatus: true, status: true, paidAt: true },
    })
    if (!order) return { success: false }
    return {
      success: true,
      paymentStatus: order.paymentStatus,
      status: order.status,
      paidAt: order.paidAt,
    }
  } catch {
    return { success: false }
  }
}

export async function cancelOrder(orderNumber: string, reason?: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Masuk untuk membatalkan.' }
  const order = await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } })
  if (!order) return { success: false, message: 'Pesanan tidak ditemukan.' }
  const isOwner = ['SUPERADMIN', 'OWNER', 'FINANCE', 'ADMIN', 'STAFF'].includes(session.role)
  const isMine = order.userId === session.userId
  if (!isOwner && !isMine) return { success: false, message: 'Bukan pesanan Anda.' }
  if (['DELIVERED', 'CANCELLED'].includes(order.status)) return { success: false, message: `Tidak bisa batal — status ${order.status}` }
  if (order.paymentStatus === 'PAID' && !isOwner) return { success: false, message: 'Pesanan lunas hanya Owner/Finance yang bisa batalkan.' }
  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { orderNumber }, data: { status: 'CANCELLED', paymentStatus: order.paymentStatus === 'PAID' ? 'PAID' : 'CANCELLED' } })
    for (const it of order.items) await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity }, soldCount: { decrement: it.quantity } } })
  })
  revalidateOrderFlow()
  revalidateCatalogAndInventory()
  await logActivity(session.role, 'Pesanan Dibatalkan', `${orderNumber} — ${reason || 'tanpa alasan'}`)
  return { success: true, message: `Pesanan ${orderNumber} dibatalkan${reason ? ': ' + reason : ''} — stok dikembalikan.` }
}

export async function requestReturn(orderNumber: string, reason: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Masuk untuk retur.' }
  const order = await prisma.order.findUnique({ where: { orderNumber } })
  if (!order) return { success: false, message: 'Pesanan tidak ditemukan.' }
  if (order.userId !== session.userId && !['SUPERADMIN', 'OWNER'].includes(session.role)) return { success: false, message: 'Bukan pesanan Anda.' }
  if (order.paymentStatus !== 'PAID') return { success: false, message: 'Hanya pesanan lunas bisa retur.' }
  await prisma.order.update({ where: { orderNumber }, data: { status: 'RETURN_REQUESTED' } })
  revalidateOrderFlow()
  await logActivity(session.role, 'Retur Diajukan', `${orderNumber} — ${reason}`)
  return { success: true, message: 'Pengajuan retur terkirim — admin akan proses.' }
}

// ── Owner: Admin account CRUD ──
const MANAGEABLE_ROLES = ['ADMIN', 'STAFF', 'SUPPLIER', 'FINANCE'] as const

export async function createAdminAccount(formData: FormData): Promise<ActionResult> {
  if (!(await requireOwner())) return { success: false, message: 'Hanya Owner.' }
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const role = (formData.get('role') as string)?.trim().toUpperCase()
  if (!name || !email || !password || !role) return { success: false, message: 'Lengkapi semua field.' }
  if (!(MANAGEABLE_ROLES as readonly string[]).includes(role)) return { success: false, message: 'Role tidak valid.' }
  if (password.length < 6) return { success: false, message: 'Password minimal 6 karakter.' }
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return { success: false, message: 'Email sudah terdaftar.' }
  await prisma.user.create({ data: { name, email, password: hashPassword(password), role } })
  revalidatePath('/dashboard/owner')
  { const s = await getSession(); if (s) await logActivity(s.role, 'Akun Dibuat', `${name} · ${role} · ${email}`) }
  return { success: true, message: `Akun ${role} dibuat.` }
}

export async function updateAdminAccount(userId: number, data: { name?: string; email?: string; role?: string; password?: string }): Promise<ActionResult> {
  if (!(await requireOwner())) return { success: false, message: 'Hanya Owner.' }
  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return { success: false, message: 'User tidak ditemukan.' }
  if (['SUPERADMIN', 'OWNER'].includes(target.role)) return { success: false, message: 'Tidak dapat mengubah Owner/Superadmin.' }
  const update: Record<string, string> = {}
  if (data.name) update.name = data.name.trim()
  if (data.email) update.email = data.email.trim().toLowerCase()
  if (data.role) {
    const r = data.role.toUpperCase()
    if (!(MANAGEABLE_ROLES as readonly string[]).includes(r) && r !== 'CUSTOMER') return { success: false, message: 'Role tidak valid.' }
    update.role = r
  }
  if (data.password) {
    if (data.password.length < 6) return { success: false, message: 'Password minimal 6 karakter.' }
    update.password = hashPassword(data.password)
  }
  if (data.email && data.email.toLowerCase() !== target.email) {
    const dup = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (dup) return { success: false, message: 'Email sudah dipakai.' }
  }
  await prisma.user.update({ where: { id: userId }, data: update })
  revalidatePath('/dashboard/owner')
  { const s = await getSession(); if (s) await logActivity(s.role, 'Akun Diperbarui', `${target.name} → ${update.name ?? target.name} · ${update.role ?? target.role}`) }
  return { success: true, message: 'Akun diperbarui.' }
}

export async function deleteAdminAccount(userId: number): Promise<ActionResult> {
  if (!(await requireOwner())) return { success: false, message: 'Hanya Owner.' }
  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return { success: false, message: 'User tidak ditemukan.' }
  if (['SUPERADMIN', 'OWNER'].includes(target.role)) return { success: false, message: 'Tidak dapat menghapus Owner/Superadmin.' }
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath('/dashboard/owner')
  { const s = await getSession(); if (s) await logActivity(s.role, 'Akun Dihapus', `${target.name} · ${target.role}`) }
  return { success: true, message: 'Akun dihapus.' }
}

// ── Finance: Expense CRUD ──
export async function addExpense(formData: FormData): Promise<ActionResult> {
  if (!(await requireFinance())) return { success: false, message: 'Akses ditolak.' }
  const amount = parseInt(formData.get('amount') as string, 10)
  const category = (formData.get('category') as string)?.trim() || 'Operasional'
  const description = (formData.get('description') as string)?.trim() || null
  const dateStr = formData.get('date') as string
  if (isNaN(amount) || amount <= 0) return { success: false, message: 'Nominal tidak valid.' }
  await prisma.expense.create({ data: { amount, category, description, date: dateStr ? new Date(dateStr) : new Date() } })
  revalidatePath('/dashboard/finance')
  revalidatePath('/dashboard/owner')
  { const s = await getSession(); if (s) await logActivity(s.role, 'Beban Dicatat', `${category} · ${amount.toLocaleString('id-ID')} — ${description ?? '-'}`) }
  return { success: true, message: 'Pengeluaran ditambahkan.' }
}

export async function deleteExpense(expenseId: number): Promise<ActionResult> {
  if (!(await requireFinance())) return { success: false, message: 'Akses ditolak.' }
  await prisma.expense.delete({ where: { id: expenseId } })
  revalidatePath('/dashboard/finance')
  revalidatePath('/dashboard/owner')
  { const s = await getSession(); if (s) await logActivity(s.role, 'Beban Dihapus', `Beban #${expenseId} dihapus`) }
  return { success: true, message: 'Pengeluaran dihapus.' }
}

// ── Supplier: Raw Materials (Bahan Baku) ──
async function requireSupplierRole(): Promise<boolean> {
  const s = await getSession()
  if (!s) return false
  return ['SUPERADMIN', 'OWNER', 'SUPPLIER'].includes(s.role)
}

export async function createRawMaterial(formData: FormData): Promise<ActionResult> {
  if (!(await requireSupplierRole())) return { success: false, message: 'Akses ditolak.' }
  const session = await getSession()
  const name = (formData.get('name') as string)?.trim()
  const sku = (formData.get('sku') as string)?.trim() || null
  const category = (formData.get('category') as string)?.trim() || 'Bahan Baku'
  const unit = (formData.get('unit') as string)?.trim() || 'kg'
  const unitCost = parseInt((formData.get('unitCost') as string) || '0', 10)
  const stock = parseFloat((formData.get('stock') as string) || '0')
  const description = (formData.get('description') as string)?.trim() || null
  if (!name) return { success: false, message: 'Nama bahan wajib.' }
  if (sku) {
    const dup = await prisma.rawMaterial.findUnique({ where: { sku } })
    if (dup) return { success: false, message: 'SKU sudah dipakai.' }
  }
  await prisma.rawMaterial.create({
    data: { name, sku, category, unit, unitCost: isNaN(unitCost) ? 0 : unitCost, stock: isNaN(stock) ? 0 : stock, description, supplierId: session?.userId ?? null },
  })
  revalidatePath('/dashboard/supplier')
  revalidatePath('/dashboard/owner')
  if (session) await logActivity(session.role, 'Bahan Baku Ditambahkan', `${name} · ${category} · ${stock}${unit} @${unitCost.toLocaleString('id-ID')}`)
  return { success: true, message: 'Bahan baku ditambahkan.' }
}

export async function updateRawMaterial(materialId: number, data: { name?: string; category?: string; unit?: string; unitCost?: number; description?: string }): Promise<ActionResult> {
  if (!(await requireSupplierRole())) return { success: false, message: 'Akses ditolak.' }
  const session = await getSession()
  const mat = await prisma.rawMaterial.findUnique({ where: { id: materialId } })
  if (!mat) return { success: false, message: 'Bahan tidak ditemukan.' }
  const isOwner = session && ['SUPERADMIN', 'OWNER'].includes(session.role)
  if (!isOwner && mat.supplierId !== null && mat.supplierId !== session?.userId) return { success: false, message: 'Bahan bukan milik Anda.' }
  await prisma.rawMaterial.update({ where: { id: materialId }, data })
  revalidatePath('/dashboard/supplier')
  { const s = await getSession(); if (s) await logActivity(s.role, 'Bahan Baku Diperbarui', `Bahan #${materialId} diperbarui`) }
  return { success: true, message: 'Bahan baku diperbarui.' }
}

export async function deleteRawMaterial(materialId: number): Promise<ActionResult> {
  if (!(await requireSupplierRole())) return { success: false, message: 'Akses ditolak.' }
  const session = await getSession()
  const mat = await prisma.rawMaterial.findUnique({ where: { id: materialId } })
  if (!mat) return { success: false, message: 'Bahan tidak ditemukan.' }
  const isOwner = session && ['SUPERADMIN', 'OWNER'].includes(session.role)
  if (!isOwner && mat.supplierId !== null && mat.supplierId !== session?.userId) return { success: false, message: 'Bahan bukan milik Anda.' }
  await prisma.rawMaterial.delete({ where: { id: materialId } })
  revalidatePath('/dashboard/supplier')
  { const s = await getSession(); if (s) await logActivity(s.role, 'Bahan Baku Dihapus', `Bahan #${materialId} dihapus`) }
  return { success: true, message: 'Bahan baku dihapus.' }
}

export async function addStockEntry(formData: FormData): Promise<ActionResult> {
  if (!(await requireSupplierRole())) return { success: false, message: 'Akses ditolak.' }
  const session = await getSession()
  const materialId = parseInt(formData.get('materialId') as string, 10)
  const quantity = parseFloat(formData.get('quantity') as string)
  const unitCost = parseInt(formData.get('unitCost') as string, 10)
  const note = (formData.get('note') as string)?.trim() || null
  const dateStr = formData.get('date') as string
  if (isNaN(materialId) || isNaN(quantity) || quantity <= 0) return { success: false, message: 'Bahan dan jumlah wajib valid.' }
  if (isNaN(unitCost) || unitCost < 0) return { success: false, message: 'Harga satuan tidak valid.' }
  const material = await prisma.rawMaterial.findUnique({ where: { id: materialId } })
  if (!material) return { success: false, message: 'Bahan tidak ditemukan.' }
  const totalCost = Math.round(quantity * unitCost)
  const entryDate = dateStr ? new Date(dateStr) : new Date()
  await prisma.$transaction(async (tx) => {
    await tx.stockEntry.create({
      data: { materialId, quantity, unitCost, totalCost, supplierId: session?.userId ?? null, note, date: entryDate },
    })
    await tx.rawMaterial.update({ where: { id: materialId }, data: { stock: { increment: quantity }, unitCost } })
    await tx.expense.create({
      data: { amount: totalCost, category: 'Bahan Baku', description: `Pasok ${material.name} ${quantity} ${material.unit} @${unitCost}${note ? ` — ${note}` : ''}`, date: entryDate },
    })
  })
  revalidatePath('/dashboard/supplier')
  revalidatePath('/dashboard/finance')
  revalidatePath('/dashboard/owner')
  if (session) await logActivity(session.role, 'Barang Masuk', `${material.name} +${quantity} ${material.unit} · ${totalCost.toLocaleString('id-ID')}`)
  return { success: true, message: `Barang masuk dicatat · ${quantity} ${material.unit} · ${totalCost.toLocaleString('id-ID')}` }
}

// ── Payroll: berbasis User (Manajemen Tim) — sinkron dengan role ──
async function requirePayrollRole(): Promise<boolean> {
  const s = await getSession()
  if (!s) return false
  return ['SUPERADMIN', 'OWNER', 'FINANCE'].includes(s.role)
}

export async function updateUserSalary(userId: number, formData: FormData): Promise<ActionResult> {
  if (!(await requirePayrollRole())) return { success: false, message: 'Akses ditolak.' }
  const baseSalary = parseFloat(formData.get('baseSalary') as string)
  if (isNaN(baseSalary) || baseSalary < 0) return { success: false, message: 'Gaji pokok tidak valid.' }
  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return { success: false, message: 'User tidak ditemukan.' }
  if (target.role === 'CUSTOMER') return { success: false, message: 'CUSTOMER bukan karyawan.' }
  if (['SUPERADMIN', 'OWNER'].includes(target.role)) return { success: false, message: 'Gaji Owner tidak dikelola di sini.' }
  await prisma.user.update({ where: { id: userId }, data: { baseSalary } })
  revalidatePath('/dashboard/finance'); revalidatePath('/dashboard/owner')
  { const s = await getSession(); if (s) await logActivity(s.role, 'Gaji Pokok Diperbarui', `${target.name} (${target.role}) → ${baseSalary.toLocaleString('id-ID')}`) }
  return { success: true, message: `Gaji pokok ${target.name} diperbarui.` }
}

// Legacy Employee CRUD kept for compat — tidak dipakai UI baru
export async function createEmployee(formData: FormData): Promise<ActionResult> {
  return updateUserSalary(0, formData)
}
export async function updateEmployee(employeeId: string, formData: FormData): Promise<ActionResult> {
  const uid = parseInt(employeeId, 10)
  if (!isNaN(uid)) return updateUserSalary(uid, formData)
  return { success: false, message: 'Gunakan Manajemen Tim untuk atur gaji.' }
}
export async function deleteEmployee(employeeId: string): Promise<ActionResult> {
  return { success: false, message: 'Kelola karyawan via Manajemen Tim.' }
}

export async function payPayroll(formData: FormData): Promise<ActionResult> {
  if (!(await requirePayrollRole())) return { success: false, message: 'Akses ditolak.' }
  const userIdStr = (formData.get('userId') as string)?.trim() || (formData.get('employeeId') as string)?.trim()
  const amountStr = formData.get('amount') as string
  const month = (formData.get('month') as string)?.trim()
  if (!userIdStr || !month) return { success: false, message: 'Karyawan dan bulan wajib diisi.' }
  const userId = parseInt(userIdStr, 10)
  if (isNaN(userId)) return { success: false, message: 'Karyawan tidak valid.' }
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, message: 'Karyawan tidak ditemukan.' }
  if (user.role === 'CUSTOMER') return { success: false, message: 'CUSTOMER bukan karyawan.' }
  const base = user.baseSalary ?? 0
  const amount = amountStr ? parseFloat(amountStr) : base
  if (isNaN(amount) || amount <= 0) return { success: false, message: 'Nominal tidak valid — atur gaji pokok dulu di daftar karyawan.' }
  const dup = await prisma.payroll.findFirst({ where: { userId, month } })
  if (dup) return { success: false, message: `Gaji ${month} untuk ${user.name} sudah dibayar.` }
  await prisma.$transaction(async (tx) => {
    await tx.payroll.create({ data: { userId, amount, month, status: 'PAID', paidAt: new Date() } })
    await tx.expense.create({
      data: { amount: Math.round(amount), category: 'Beban Gaji', description: `Gaji ${user.name} (${user.role}) — ${month}`, date: new Date() },
    })
  })
  revalidatePath('/dashboard/finance'); revalidatePath('/dashboard/owner')
  { const s = await getSession(); if (s) await logActivity(s.role, 'Penggajian Diproses', `${user.name} (${user.role}) · ${month} · ${amount.toLocaleString('id-ID')} → Beban Gaji`) }
  return { success: true, message: `Gaji ${user.name} ${month} dibayar — tercatat ke Beban Gaji.` }
}

export async function deletePayroll(payrollId: string): Promise<ActionResult> {
  if (!(await requirePayrollRole())) return { success: false, message: 'Akses ditolak.' }
  const p = await prisma.payroll.findUnique({ where: { id: payrollId }, include: { user: true } })
  await prisma.payroll.delete({ where: { id: payrollId } })
  revalidatePath('/dashboard/finance'); revalidatePath('/dashboard/owner')
  { const s = await getSession(); if (s) await logActivity(s.role, 'Riwayat Gaji Dihapus', `Payroll ${payrollId}${p?.user ? ` · ${p.user.name}` : ''} dihapus`) }
  return { success: true, message: 'Riwayat gaji dihapus.' }
}

// ── Reviews ──
export async function submitReview(productId: number, rating: number, comment: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Masuk untuk memberi ulasan.' }
  if (rating < 1 || rating > 5) return { success: false, message: 'Rating 1–5.' }
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return { success: false, message: 'Produk tidak ditemukan.' }
  // opsional: hanya yang pernah beli PAID — longgarin: izinkan semua login, tapi tandai verified
  const purchased = await prisma.order.findFirst({
    where: { userId: session.userId, paymentStatus: 'PAID', items: { some: { productId } } },
  })
  const existing = await prisma.review.findFirst({ where: { productId, userId: session.userId } })
  if (existing) {
    await prisma.review.update({ where: { id: existing.id }, data: { rating, comment: comment.trim() || null } })
  } else {
    await prisma.review.create({ data: { productId, userId: session.userId, rating, comment: comment.trim() || null } })
  }
  // recompute aggregate
  const agg = await prisma.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: true })
  await prisma.product.update({ where: { id: productId }, data: { rating: agg._avg.rating ?? rating, reviewCount: agg._count } })
  revalidatePath('/produk'); revalidatePath('/'); revalidatePath(`/produk/${product.slug ?? productId}`)
  await logActivity(session.role, purchased ? 'Ulasan Terverifikasi' : 'Ulasan Ditambahkan', `${product.name} ★${rating}${comment ? ` — ${comment.slice(0, 60)}` : ''}`)
  return { success: true, message: existing ? 'Ulasan diperbarui.' : 'Ulasan terkirim — terima kasih!' }
}

export async function getProductReviews(productId: number): Promise<{ id: string; rating: number; comment: string | null; createdAt: Date; userName: string; verified: boolean }[]> {
  const rows = await prisma.review.findMany({ where: { productId }, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } }, take: 50 })
  // verified = user pernah beli PAID produk ini
  const verifiedIds = new Set<string>()
  for (const r of rows) {
    if (!r.userId) continue
    const has = await prisma.order.findFirst({ where: { userId: r.userId, paymentStatus: 'PAID', items: { some: { productId } } }, select: { id: true } })
    if (has) verifiedIds.add(r.id)
  }
  return rows.map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, createdAt: r.createdAt, userName: r.user?.name ?? 'Anonim', verified: verifiedIds.has(r.id) }))
}

// ── Stok menipis helper (dipakai dashboard + notifikasi) ──
export async function getLowStockAlerts(threshold = 15): Promise<{ products: { id: number; name: string; stock: number }[]; rawMaterials: { id: number; name: string; stock: number; unit: string }[] }> {
  const [products, rawMaterials] = await Promise.all([
    prisma.product.findMany({ where: { stock: { lt: threshold } }, select: { id: true, name: true, stock: true }, take: 20 }),
    prisma.rawMaterial.findMany({ where: { stock: { lt: threshold } }, select: { id: true, name: true, stock: true, unit: true }, take: 20 }),
  ])
  return { products, rawMaterials }
}

// ── Cron: auto-cancel pesanan kadaluarsa (expiresAt < now) ──
export async function expireOverdueOrders(): Promise<{ expired: number; restored: number }> {
  const now = new Date()
  const overdue = await prisma.order.findMany({
    where: { expiresAt: { lt: now }, status: { in: ['AWAITING_PAYMENT', 'PENDING'] }, paymentStatus: 'PENDING' },
    include: { items: true },
  })
  if (overdue.length === 0) return { expired: 0, restored: 0 }
  let restored = 0
  for (const o of overdue) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: o.id }, data: { status: 'CANCELLED', paymentStatus: 'CANCELLED' } })
      for (const it of o.items) {
        await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity }, soldCount: { decrement: it.quantity } } })
        restored += it.quantity
      }
    })
    await logActivity('SYSTEM', 'Pesanan Kadaluarsa', `${o.orderNumber} dibatalkan otomatis — stok dikembalikan`)
  }
  revalidatePath('/dashboard/admin'); revalidatePath('/dashboard/owner'); revalidatePath('/profile')
  return { expired: overdue.length, restored }
}

