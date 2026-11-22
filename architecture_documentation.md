# Tahu Sumedang — Dokumentasi Arsitektur Teknis

> **Next.js 16 (App Router) · Prisma ORM · SQLite · TypeScript · Tailwind CSS · Framer Motion / GSAP**
> Proyek E-Commerce + ERP Monolitik untuk Tugas Kuliah

**Versi:** 2.0 · 13 Oktober 2026
**Repo:** `tahu-sumedang-store` · `next@16.3.6` · `prisma@5.22.0` · `react@19.2.8`

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [System Architecture — Monolit Next.js App Router](#2-system-architecture--monolit-nextjs-app-router)
3. [Backend & Server-Side Logic — Server Actions](#3-backend--server-side-logic--server-actions)
4. [Database & Storage — SQLite + Prisma ORM](#4-database--storage--sqlite--prisma-orm)
5. [Data Flow & Persistence](#5-data-flow--persistence)
6. [Keamanan, RBAC & Middleware](#6-keamanan-rbac--middleware)
7. [Keuangan & Ledger — Alur Kas Atomik](#7-keuangan--ledger--alur-kas-atomik)
8. [Audit Trail Lintas Divisi](#8-audit-trail-lintas-divisi)
9. [UI/UX — Warm Artisanal Light Theme](#9-uiux--warm-artisanal-light-theme)
10. [Struktur Direktori & Peta Modul](#10-struktur-direktori--peta-modul)
11. [Build, Deploy & Operasional](#11-build-deploy--operasional)
12. [Lampiran — Diagram & Referensi](#12-lampiran--diagram--referensi)

---

## 1. Ringkasan Eksekutif

**Tahu Sumedang Store** adalah aplikasi **full-stack monolitik** di atas **Next.js App Router**. Seluruh lapisan — rendering, routing, autentikasi, logika bisnis, akses data, ERP ringan — hidup dalam **satu proses Node.js / satu repositori**, tanpa backend terpisah.

| Pilar | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 16 App Router (Turbopack) | SSR + RSC + streaming + file-based routing satu runtime |
| Bahasa | TypeScript 5 (strict) | Keamanan tipe end-to-end DB → UI |
| ORM | Prisma Client 5.22 | Type-safe query builder + migrasi deklaratif |
| Database | SQLite (`prisma/dev.db`) | File-based, zero-ops, ideal demo kampus; migrasi mudah ke Postgres |
| Auth | `jose` (JWT HS256, 7d) + `bcryptjs` + HttpOnly cookie `ts_session` | Tanpa OAuth eksternal |
| Styling | Tailwind CSS 4 + Vanilla CSS tokens | Warm Artisanal Light Theme |
| Animasi | Framer Motion 13 + GSAP 3.15 | Tab blur 0.28s + micro-interaction |
| State | Server Components + `useTransition` + `revalidatePath` | Tanpa React Query/SWR |

> Prinsip: *Keep it solid and maintainable for university evaluation* — satu sumber kebenaran, tanpa microservices yang tidak perlu. Ledger keuangan = `Order.paymentStatus === 'PAID'` sebagai sumber kebenaran tunggal.

**Perubahan v1.0 → v2.0:**
- Schema 5 → 10 model (tambah `RawMaterial`, `StockEntry`, `Employee` legacy, `Payroll`, `ActivityLog`; `User.baseSalary`).
- ERP: modul Supplier (bahan baku + barang masuk), Penggajian berbasis `User` (sinkron Manajemen Tim), Rekonsiliasi pembayaran, Laporan keuangan bucket harian/mingguan.
- Payment: `VA_BCA/MANDIRI/BNI/BRI`, `QRIS`, `RETAIL_INDOMARET/ALFAMART`, `COD`; auto-settlement 22s/28s.
- Security hardening: `confirmOrderPayment` RBAC + guest isolation, `update/delete RawMaterial` ownership check.
- Audit trail global + `ActivityFeed` di 4 dashboard.

---

## 2. System Architecture — Monolit Next.js App Router

### 2.1 Gambaran Monolit Terpadu

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS MONOLITH (satu proses)               │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │  App Router  │  │ Server Actions / │  │  Prisma Client   │  │
│  │  (RSC + SSR) │◄─┤ Route Handlers   │◄─┤  (type-safe)     │  │
│  │  React 19    │  │  "use server"    │  │                   │  │
│  └──────┬───────┘  └────────┬─────────┘  └────────┬──────────┘  │
│         │                   │                     │              │
│         └───────────────────┴─────────────────────┘              │
│                              │                                  │
│                    ┌─────────▼─────────┐                        │
│                    │  SQLite dev.db    │  file:./dev.db         │
│                    │  + prisma/seed.ts │                        │
│                    └───────────────────┘                        │
│                    ┌─────────▼─────────┐                        │
│                    │  Middleware (JWT) │  matcher: /dashboard/* │
│                    │  + lib/auth.ts    │  /admin/*, /profile/*  │
│                    └───────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
          ▲                                    │
          │ HTTP                               │ Cookie ts_session (httpOnly, SameSite=Lax)
     Browser / Client Components (Navbar, Cart, CheckoutModal, OrderSuccess, Finance/Owner/Supplier/Admin dashboards)
```

**Mengapa monolit untuk tugas kuliah:**

- Satu deployment (`next build && next start`) tanpa orkestrasi.
- Shared types — tipe Prisma dipakai langsung di komponen.
- Colocation — tiap rute `app/**/page.tsx` berdampingan dengan logikanya.
- RSC kirim HTML minimal + streaming; Client Components hanya di-hydrate di mana perlu (`'use client'`).

### 2.2 Lapisan Rendering — Server vs Client Components

| Lapisan | Contoh File | Direktif | Tanggung Jawab |
|---|---|---|---|
| **Server Components** (default) | `app/page.tsx`, `app/dashboard/*/page.tsx`, `app/profile/page.tsx` | *(tanpa direktif)*, `export const dynamic='force-dynamic'` | Fetch via `prisma.*`, `getSession()`, `redirect()`, aggregate metrik |
| **Client Components** | `components/StoreClient.tsx`, `components/dashboard/*Client.tsx`, `components/profile/ProfileClient.tsx`, `components/CheckoutModal.tsx`, `components/OrderSuccess.tsx` | `'use client'` | State, Framer Motion, `useTransition`, cart/checkout |
| **Shared / Utility** | `lib/prisma.ts`, `lib/auth.ts`, `lib/utils.ts`, `lib/payment.ts`, `lib/storeAccount.ts` | — | Singleton Prisma, JWT helpers, `formatRupiah`, VA/QRIS generator |

**Aturan:** Data fetching dan auth guard selalu di Server Components; animasi dan event handler di Client Components. Tidak ada `fetch('/api/...')` untuk katalog — Server Component memanggil Prisma langsung. Tidak ada `route.ts` API (attack surface minimal).

### 2.3 Routing — File-Based

```
app/
├── page.tsx                     →  /                        (katalog + hero)
├── layout.tsx                   →  RootLayout (font, metadata)
├── globals.css                  →  Design tokens Warm Artisanal
├── login/page.tsx               →  /login
├── register/page.tsx            →  /register
├── profile/page.tsx             →  /profile                (guard + ProfileClient, where userId==session.userId)
├── admin/page.tsx               →  /admin                  (legacy redirect)
└── dashboard/
    ├── owner/page.tsx           →  /dashboard/owner        (SUPERADMIN/OWNER — 8 tab)
    ├── admin/page.tsx           →  /dashboard/admin        (ADMIN/STAFF + Owner)
    ├── supplier/page.tsx        →  /dashboard/supplier     (SUPPLIER + Owner — 2 tab)
    ├── finance/page.tsx         →  /dashboard/finance      (FINANCE + Owner — 6 tab)
    └── customer/page.tsx        →  /dashboard/customer     (→ /profile)
middleware.ts                    →  Proxy/Middleware         (RBAC gate, jwtVerify via jose)
```

`middleware.ts` dieksekusi sebelum setiap request ke `/dashboard/*`, `/admin/*`, `/profile/*`.

---

## 3. Backend & Server-Side Logic — Server Actions

### 3.1 Filosofi: Tanpa Backend Eksternal

Semua logika backend diekspos sebagai **Server Actions** (`'use server'`) — Next.js serialisasi argumen, eksekusi di server, `revalidatePath` otomatis.

```
Client Component                      Server (Node)
──────────────                        ──────────────
onClick → start(async () => {         lib/actions.ts  "use server"
  await createOrder(payload)    ─────►  createOrder()
  await confirmOrderPayment(n)  ─────►  confirmOrderPayment()
  await addStockEntry(fd)       ─────►  addStockEntry()
})                                    prisma.* + logActivity()
                                      revalidatePath("/")
                                      revalidatePath("/dashboard/*")
```

### 3.2 Inventaris Server Actions — `lib/actions.ts`

| Modul | Action | Guard | Efek Samping & Catatan |
|---|---|---|---|
| **Order** | `createOrder(payload)` | `session.role==='CUSTOMER'` only | `prisma.$transaction`: stock check → `order.create` + `items.create` → `product decrement`; VA/QRIS/Retail `AWAITING_PAYMENT` + `expiresAt` 24h/48h; COD `UNPAID/PROCESSING`; `logActivity` |
| | `confirmOrderPayment(orderNumber)` | **RBAC:** `SUPERADMIN/OWNER/FINANCE` atau `order.userId===session.userId`; guest hanya jika `order.userId===null`; idempotent `PAID` | `order.update { paymentStatus:'PAID', paidAt }`; revalidate 6 path; `logActivity`; harden v2.0 |
| | `updateOrderStatus(orderId, status)` | `requireOrderManageRole()` | `order.update` + log |
| | `getOrderPaymentStatus` | — (read) | Polling untuk OrderSuccess |
| **Produk** | `addProduct` / `updateStock` / `deleteProduct` / `updateProduct` | `requireInventoryRole()` | `product.*` + log |
| **Akun** | `createAdminAccount` / `updateAdminAccount` / `deleteAdminAccount` | `requireOwner()` | `user.*` hash; proteksi SUPERADMIN/OWNER |
| **Keuangan** | `addExpense` / `deleteExpense` | `requireFinance()` | `expense.*` + log |
| **Supplier** | `createRawMaterial` | `requireSupplierRole()` | `rawMaterial.create { supplierId: session.userId }` |
| | `updateRawMaterial` / `deleteRawMaterial` | `requireSupplierRole()` + **ownership** `supplierId === session.userId` (OWNER bypass) | IDOR fix v2.0 + log |
| | `addStockEntry` | `requireSupplierRole()` | `prisma.$transaction`: `stockEntry.create` + `rawMaterial increment` + `expense Bahan Baku` atomik |
| **Payroll** | `updateUserSalary(userId, fd)` | `requirePayrollRole()` | `user.update { baseSalary }`; tolak CUSTOMER & OWNER |
| | `payPayroll(fd)` | `requirePayrollRole()` | `prisma.$transaction`: `payroll.create` + `expense Beban Gaji`; `@@unique [userId,month]` cegah double-pay |
| | `deletePayroll` | `requirePayrollRole()` | + `logActivity` (fix v2.0) |
| | `create/update/delete Employee` | legacy stub | Delegasi ke `updateUserSalary` |
| `lib/authActions.ts` | `registerAction` / `loginAction` / `requestPhoneOtpAction` / `verifyPhoneOtpAction` / `socialLoginAction` / `updateProfileAction` / `logoutAction` | — / `getSession()` | `hashPassword` + `signSession` + `setSessionCookie` (httpOnly) |

**Helper guard:**

```ts
requireInventoryRole()    → ['SUPERADMIN','OWNER','ADMIN','STAFF']
requireOrderManageRole()  → ['SUPERADMIN','OWNER','ADMIN','STAFF','FINANCE']
requireOwner()            → ['SUPERADMIN','OWNER']
requireFinance()          → ['SUPERADMIN','OWNER','FINANCE']
requireSupplierRole()     → ['SUPERADMIN','OWNER','SUPPLIER']
requirePayrollRole()      → ['SUPERADMIN','OWNER','FINANCE']
```

### 3.3 Autentikasi — JWT + HttpOnly Cookie

```
Register/Login ──► hashPassword (bcryptjs, 10 rounds)
                ──► signSession({ userId, email, name, role })  [jose HS256, 7d]
                ──► setSessionCookie(token)  →  Set-Cookie: ts_session=...; HttpOnly; SameSite=Lax; Secure(prod); MaxAge 7d
Browser ── Cookie ts_session ────────► getSession() / middleware jwtVerify() ──► payload.role ──► RBAC gate
```

- **Secret:** `process.env.JWT_SECRET` (fallback dev-only 32-char, wajib ganti di produksi).
- **Penyimpanan:** HttpOnly — tidak terbaca `document.cookie`, mitigasi XSS.
- **OTP & social:** `OTP_MAP` in-memory untuk demo; produksi ganti Redis/DB + OAuth.

### 3.4 Pembayaran — Virtual Account, QRIS, Retail (Mock Terkontrol)

`lib/payment.ts` + `lib/storeAccount.ts` (Rekening Operasional `BCA 8880123456 a.n. Tahu Sumedang Official`):

| Metode | `paymentStatus` | `status` | Payload | Expiry |
|---|---|---|---|---|
| `VA_BCA` / `VA_MANDIRI` / `VA_BNI` / `VA_BRI` | `PENDING` | `AWAITING_PAYMENT` | `generateVaNumber(method, orderNumber)` suffix rekening operasional | 24 jam |
| `QRIS` | `PENDING` | `AWAITING_PAYMENT` | `generateQrisPayload(orderNumber)` EMV-QR mock | 24 jam |
| `RETAIL_INDOMARET` / `RETAIL_ALFAMART` | `PENDING` | `AWAITING_PAYMENT` | `generateRetailCode(orderNumber)` | 48 jam |
| `COD` | `UNPAID` | `PROCESSING` | — | — |

Auto-settlement di `components/OrderSuccess.tsx`: polling `getOrderPaymentStatus` + `setTimeout` 22s (QRIS) / 28s (VA/Retail) + tombol manual `Verifikasi Lunas` → `confirmOrderPayment`.

---

## 4. Database & Storage — SQLite + Prisma ORM

### 4.1 Mengapa SQLite untuk Proyek Kampus

| Aspek | SQLite (`dev.db`) | Alternatif (Postgres/MySQL) |
|---|---|---|
| Instalasi | Nol — file `prisma/dev.db` | Perlu server, user, password |
| Portabilitas | Satu file, mudah di-zip untuk pengumpulan | Dump/restore |
| Performa demo | Cukup (< 2k order) | Overkill |
| Prisma support | Native (`provider = "sqlite"`) | Sama, migrasi mudah |

`DATABASE_URL="file:./dev.db"` di `.env`; `prisma.config.ts` → `schema.prisma`. Prod: ganti `provider = "postgresql"` + `DATABASE_URL` Neon/Supabase.

### 4.2 Skema Prisma — `prisma/schema.prisma`

> SQLite tanpa enum native — semua status/role disimpan `String`, divalidasi di aplikasi.

```prisma
datasource db { provider = "sqlite"; url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      String   @default("CUSTOMER")
  phone     String?
  address   String?
  city      String?
  baseSalary Float?  @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
  suppliedProducts Product[] @relation("SupplierProducts")
  suppliedMaterials RawMaterial[] @relation("SupplierMaterials")
  stockEntries StockEntry[]
  payrolls  Payroll[]
}

model Product {
  id            Int         @id @default(autoincrement())
  name          String
  slug          String?     @unique
  category      String      @default("Tahu Goreng")
  price         Int
  originalPrice Int?
  stock         Int         @default(50)
  soldCount     Int         @default(0)
  rating        Float       @default(4.9)
  reviewCount   Int         @default(28)
  description   String?
  image         String?
  badge         String?
  isFlashSale   Boolean     @default(false)
  isPopular     Boolean     @default(false)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  orderItems    OrderItem[]
  supplierId    Int?
  supplier      User?       @relation("SupplierProducts", fields: [supplierId], references: [id])
}

model Order {
  id             Int      @id @default(autoincrement())
  orderNumber    String   @unique
  userId         Int?
  user           User?    @relation(fields: [userId], references: [id])
  customerName   String
  customerPhone  String
  customerEmail  String?
  address        String
  city           String
  postalCode     String?
  notes          String?
  shippingMethod String
  shippingCost   Int      @default(0)
  paymentMethod  String   @default("COD")
  paymentStatus  String   @default("PENDING")
  paymentRef     String?
  vaNumber       String?
  qrisPayload    String?
  paidAt         DateTime?
  expiresAt      DateTime?
  subtotal       Int
  discount       Int      @default(0)
  totalAmount    Int
  status         String   @default("PENDING")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  items          OrderItem[]
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId Int
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Int
  variant   String?
}

model Expense {
  id          Int      @id @default(autoincrement())
  amount      Int
  category    String   @default("Operasional")
  description String?
  date        DateTime @default(now())
  createdAt   DateTime @default(now())
}

model RawMaterial {
  id          Int      @id @default(autoincrement())
  name        String
  sku         String?  @unique
  category    String   @default("Bahan Baku")
  unit        String   @default("kg")
  stock       Float    @default(0)
  unitCost    Int      @default(0)
  supplierId  Int?
  supplier    User?    @relation("SupplierMaterials", fields: [supplierId], references: [id])
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  entries     StockEntry[]
}

model StockEntry {
  id            Int         @id @default(autoincrement())
  materialId    Int
  material      RawMaterial @relation(fields: [materialId], references: [id], onDelete: Cascade)
  quantity      Float
  unitCost      Int
  totalCost     Int
  supplierId    Int?
  supplier      User?       @relation(fields: [supplierId], references: [id])
  note          String?
  date          DateTime    @default(now())
  createdAt     DateTime    @default(now())
}

model Employee {
  id        String   @id @default(cuid())
  name      String
  position  String
  baseSalary Float
  phone     String?
  createdAt DateTime @default(now())
  payrolls  Payroll[]
}

model Payroll {
  id         String   @id @default(cuid())
  employeeId String?  @unique
  employee   Employee? @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  userId     Int?
  user       User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount     Float
  month      String
  status     String   @default("PAID")
  paidAt     DateTime @default(now())
  createdAt  DateTime @default(now())
  @@unique([userId, month])
  @@unique([employeeId, month])
}

model ActivityLog {
  id        String   @id @default(cuid())
  role      String
  action    String
  message   String
  createdAt DateTime @default(now())
}
```

**Constraint kunci:** `email/slug/orderNumber/sku @unique`, `OrderItem/StockEntry onDelete:Cascade`, `Payroll @@unique [userId,month]`.

### 4.3 Prisma Client — `lib/prisma.ts`

```ts
export const prisma = globalThis.prismaGlobal ?? new PrismaClient({ log: ['error','warn'] })
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
```

### 4.4 Seed — `prisma/seed.ts`

| Entitas | Volume | Teknik |
|---|---|---|
| Users | 11 (OWNER, SUPERADMIN, ADMIN, STAFF, 2× SUPPLIER, 2× FINANCE, 3× CUSTOMER) + baseSalary | `upsert` by `email` + `hashSync` |
| Products | 8 (Besek, Mercon, Walik, Gejrot, Frozen, Sambal, Hampers) | `upsert` by `slug` |
| Orders | ~870 (365 hari × 1–6/hari, 82% PAID) | Loop `daysAgo 365→0`, weekend bump |
| Expenses | ~80 (53 minggu × 1–2) | Weekly budget `≈520k × 33%` revenue |

Reset: `OrderItem → StockEntry → Payroll → RawMaterial → Order → Expense → Product → User` berurutan; idempotent.

---

## 5. Data Flow & Persistence

### 5.1 Alur Baca — Katalog & Dashboard

```
Browser GET /  ──►  app/page.tsx (Server Component)
                       ├─► prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
                       ├─► getSession() → jwtVerify(ts_session)
                       └─► <StoreClient products={...} session={...} />
```

Finance:

```
GET /dashboard/finance
  → middleware: jwtVerify + role ∈ {SUPERADMIN,OWNER,FINANCE}
  → app/dashboard/finance/page.tsx: Promise.all([ order, expense, payroll, activityLog ])
  → <FinanceClient /> → useMemo filter by range (today/7d/30d/90d/365d) + view (combined/income/expense) → bucket chart
```

### 5.2 Alur Tulis — Checkout

```
CheckoutModal → createOrder(payload) [CUSTOMER only]
  → validasi + generateVaNumber/qrisPayload
  → prisma.$transaction: stock check → order.create + items.create → product decrement
  → revalidatePath + logActivity → { orderNumber, vaNumber }
  → <OrderSuccess> polling + auto-settle 22s/28s → confirmOrderPayment → PAID
```

### 5.3 Revalidasi & Konsistensi

- `revalidatePath(path)` + `force-dynamic` di semua dashboard — selalu fresh.
- Transaksi: `prisma.$transaction(async (tx) => { ... })` untuk `createOrder`, `addStockEntry`, `payPayroll`.

### 5.4 Persistensi Lokal

- File: `prisma/dev.db` (+ WAL) — gitignored.
- Migrasi: `npx prisma db push` (dev) atau `npx prisma migrate dev` (prod).
- Reset: `rm prisma/dev.db && npx prisma db push && npx tsx prisma/seed.ts`.

---

## 6. Keamanan, RBAC & Middleware

### 6.1 Matriks Peran

| Peran | Dashboard | Akses |
|---|---|---|
| `SUPERADMIN` / `OWNER` | `/dashboard/owner` (+ semua) | Global — kelola admin, semua laporan, inspeksi lintas divisi |
| `ADMIN` / `STAFF` | `/dashboard/admin`, `/admin` | Kelola produk & pesanan |
| `SUPPLIER` | `/dashboard/supplier` | Bahan baku milik sendiri + barang masuk |
| `FINANCE` | `/dashboard/finance` | Pemasukan/pengeluaran/laba + Rekonsiliasi + Penggajian |
| `CUSTOMER` | `/profile` | Edit profil + riwayat pesanan (`where userId==session.userId`) |

### 6.2 Middleware — `middleware.ts`

```ts
DASHBOARD_ROLES = {
  '/dashboard/owner':    ['SUPERADMIN','OWNER'],
  '/dashboard/admin':    ['SUPERADMIN','OWNER','ADMIN','STAFF'],
  '/admin':              ['SUPERADMIN','OWNER','ADMIN','STAFF'],
  '/dashboard/supplier': ['SUPERADMIN','OWNER','SUPPLIER'],
  '/dashboard/finance':  ['SUPERADMIN','OWNER','FINANCE'],
  '/profile':            ['SUPERADMIN','OWNER','ADMIN','STAFF','SUPPLIER','FINANCE','CUSTOMER'],
}
matcher = ['/admin/:path*', '/dashboard/:path*', '/profile/:path*']
```

Alur: `req.cookies.get('ts_session')` → `jwtVerify(token, SECRET)` → cek `payload.role ∈ allowed` → `NextResponse.next()` atau `redirect('/login?error=forbidden')`.

> Catatan: `DASHBOARD_ROLES` diduplikasi di `middleware.ts` dan `lib/rbac.ts` — jaga sinkronisasi.

### 6.3 Hardening v2.0 (Audit 13 Okt 2026)

| Temuan | Severity | Fix |
|---|---|---|
| `confirmOrderPayment` tanpa guard | **Kritis** | RBAC OWNER/FINANCE atau pemilik order; guest hanya `userId===null`; idempotent |
| `update/delete RawMaterial` tanpa ownership | **Medium IDOR** | Cek `supplierId === session.userId`, OWNER bypass |
| `deletePayroll` tanpa audit log | Low | Tambah `logActivity` |

### 6.4 Praktik Keamanan Lain

- Password `bcryptjs` 10 rounds; validasi `password < 6`, `email` duplikat, `amount ≤ 0`, `paymentMethod` whitelist.
- Cookie `HttpOnly` + `SameSite=Lax`; tanpa `dangerouslySetInnerHTML`.

---

## 7. Keuangan & Ledger — Alur Kas Atomik

Ledger sumber kebenaran = `Order` dengan `paymentStatus === 'PAID'`.

```
createOrder ──► Order PENDING/AWAITING_PAYMENT ──► confirmOrderPayment ──► PAID + paidAt
                        └── stock decrement (atomik)              └── Finance/Owner: paidOrders.reduce(sum totalAmount)
addStockEntry ──► StockEntry + RawMaterial increment + Expense "Bahan Baku" (atomik tx)
payPayroll    ──► Payroll + Expense "Beban Gaji" (atomik tx, @@unique cegah double)
addExpense    ──► Expense
```

- `totalAmount = max(0, subtotal + shippingCost - discount)`.
- Finance `buckets`: `rangeStart(range)` → `paidOrders` + `expensesInRange` → revenue/expense/profit per hari/minggu.
- `pendingRevenue` = `paymentStatus !== 'PAID' && status not in DELIVERED/CANCELLED`.

---

## 8. Audit Trail Lintas Divisi

**Model:** `ActivityLog { role, action, message, createdAt }`.

**Pencatatan:** `logActivity(role, action, message)` di setiap action kritis — Pesanan Baru, Status Diubah, Pembayaran Diverifikasi, Produk Ditambahkan/Diperbarui/Dihapus, Akun Dibuat/Diperbarui/Dihapus, Beban Dicatat/Dihapus, Bahan Baku Ditambahkan/Diperbarui/Dihapus, Barang Masuk, Gaji Pokok Diperbarui, Penggajian Diproses, Riwayat Gaji Dihapus. `try/catch` agar gagal log tidak blokir transaksi.

**Feed:** `components/dashboard/ActivityFeed.tsx` — `roleColor` + `timeAgo` + Warm tokens; dirender di Owner/Finance/Admin/Supplier, `take: 30, orderBy: { createdAt: 'desc' }`, real-time via `revalidatePath` + `force-dynamic`.

---

## 9. UI/UX — Warm Artisanal Light Theme

**Tokens** (`app/globals.css`):

| Token | Nilai | Penggunaan |
|---|---|---|
| `--bg` | `#FAF9F6` Warm Ivory | Background utama |
| `--card` | `#FFFFFF` Pure White | Card |
| `--border` | `#E5E2DC` Stone | Border |
| `--text-primary` | `#1C1917` Deep Espresso | Heading |
| `--accent` | `#D97706` Warm Amber | CTA, chart |
| `--success` | `#059669` Sage | Pendapatan |
| `--danger` | `#DC2626` | Beban |

Typography: `Plus Jakarta Sans` + `Outfit` + `JetBrains Mono` (rupiah `tabular-nums`).

**Resilience:** KPI `min-h-[112px]`, `overflow-hidden`, `break-all` — anti clipping. Sidebar `lg:col-span-3 sticky`, chart `minWidth = bucketCount * bucketMin` + scroll buttons untuk `90d/365d`. Tab `framer-motion` blur 0.28s `[0.22,1,0.36,1]` konsisten di 6 tab Finance + 8 tab Owner + 2 tab Supplier.

---

## 10. Struktur Direktori & Peta Modul

```
tahu-sumedang-store/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── profile/page.tsx
│   └── dashboard/
│       ├── owner/page.tsx      # 8 tab
│       ├── admin/page.tsx
│       ├── supplier/page.tsx   # 2 tab
│       ├── finance/page.tsx    # 6 tab
│       └── customer/page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── StoreClient.tsx
│   ├── CheckoutModal.tsx
│   ├── OrderSuccess.tsx
│   ├── dashboard/
│   │   ├── Shell.tsx
│   │   ├── FinanceClient.tsx
│   │   ├── OwnerDashboardClient.tsx
│   │   ├── OwnerAdminsClient.tsx
│   │   ├── SupplierBahanBakuClient.tsx
│   │   ├── AdminDashboardClient.tsx
│   │   ├── PayrollManager.tsx
│   │   └── ActivityFeed.tsx
│   └── profile/ProfileClient.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── authActions.ts
│   ├── actions.ts              # hardened v2.0
│   ├── rbac.ts
│   ├── payment.ts
│   ├── storeAccount.ts         # BCA 8880123456
│   └── utils.ts
├── prisma/
│   ├── schema.prisma           # 10 model
│   ├── seed.ts
│   └── dev.db
├── middleware.ts
└── public/
```

---

## 11. Build, Deploy & Operasional

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Dev server Turbopack + HMR |
| `npx tsc --noEmit` | Typecheck (CI gate) |
| `npx prisma db push` | Sync schema → dev.db |
| `npx prisma migrate dev --name <msg>` | Migrasi versioned |
| `npx prisma generate` | Regenerasi client |
| `npx tsx prisma/seed.ts` | Reset & seed idempotent |
| `npm run build` | Production build |
| `npm start` | Serve production |

**Windows:** `prisma generate` kadang `EPERM` karena lock dev server — `Stop-Process -Name node` lalu ulangi.

**Deploy:** `Dockerfile` (`node:20-alpine` + `prisma generate` + `next build`) atau Vercel (set `DATABASE_URL` ke Postgres/Neon, ganti `provider = "postgresql"`). `JWT_SECRET` 32+ char wajib di prod.

---

## 12. Lampiran — Diagram & Referensi

### 12.1 Sequence — Checkout VA_BCA → Auto-Settlement

```
Browser          Server Action (createOrder)         Prisma/SQLite          OrderSuccess
  │                        │                              │                      │
  ├─► payload ────────────►│                              │                      │
  │                        ├─► validate + generateVa     │                      │
  │                        ├─► $transaction stock check  │                      │
  │                        ├─► order.create ────────────►│ INSERT Order         │
  │                        ├─► product.update ───────────► UPDATE stock         │
  │                        ├─► revalidatePath             │                      │
  │◄── {orderNumber,vaNo} ─┤                              │                      │
  ├─► <OrderSuccess va> ────────────────────────────────────────────────────────►│
  │                        │                              │              polling + 28s → confirmOrderPayment → PAID
```

### 12.2 Dependensi — `package.json`

```
@prisma/client 5.22, bcryptjs 3.0, gsap 3.15, jose 6.2, next 16.3, react 19, framer-motion 13
dev: prisma 5.22, tailwindcss 4, typescript 5, eslint 9
```

### 12.3 Referensi

- Next.js App Router — https://nextjs.org/docs/app
- Prisma with SQLite — https://www.prisma.io/docs/orm/prisma-client
- Design tokens — `app/globals.css` Warm Artisanal Light Theme

---

*Dokumen untuk laporan tugas kuliah. Merujuk state repo per 13 Oktober 2026 (v2.0).*

coded by :
Ernest William
202433500455
