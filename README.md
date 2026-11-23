# Tahu Sumedang — E-Commerce + ERP Store

Warm Artisanal Light Theme e-commerce & ERP ringan untuk **Tahu Sumedang** (tahu goreng autentik Jawa Barat).

**Stack:** Next.js 16 (App Router, Turbopack) · Prisma 5.22 + PostgreSQL (Supabase) · Supabase Storage · Tailwind CSS 4 · Framer Motion · GSAP · jose JWT

---

## ⚡ Quick Links

- **🚀 [START HERE](./START_HERE.md)** - Panduan setup pertama untuk pemula
- **📋 [Quick Start Guide](./QUICK_START.md)** - Setup dalam 10 menit
- **📚 [Dokumentasi Lengkap](./SUPABASE_SETUP.md)** - Detail A-Z
- **✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Checklist deploy
- **🔧 [Troubleshooting](./docs/TROUBLESHOOTING.md)** - Solusi error umum

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase & Environment
1. Buat project di [Supabase](https://supabase.com)
2. Copy `.env.example` ke `.env`
3. Isi credentials Supabase (lihat [panduan lengkap](./docs/SUPABASE_CREDENTIALS.md))
4. Generate secrets:
```bash
npm run generate:secrets
```

### 3. Setup Database
```bash
npx prisma db push        # Push schema ke Supabase
npm run db:seed           # Seed data awal
```

### 4. Run Development
```bash
npm run dev               # http://localhost:3000
```

**Akun seed:** `owner@tahu.id / owner123`, `admin@tahu.id / admin123`, `finance@tahu.id / finance123`, `supplier@tahu.id / supplier123`, customer `customer@tahu.id / customer123`.

### 5. Deploy ke Vercel
Ikuti panduan: [QUICK_START.md](./QUICK_START.md) atau [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## Roles & Dashboards

| Role | Route | Akses |
|------|-------|-------|
| `SUPERADMIN` / `OWNER` | `/dashboard/owner` (8 tab) | Global — ringkasan, pesanan, inventaris, keuangan, kinerja, tim, penggajian, aktivitas |
| `ADMIN` / `STAFF` | `/dashboard/admin` | Katalog & pesanan |
| `SUPPLIER` | `/dashboard/supplier` (2 tab) | Daftar bahan baku + riwayat pasok (ownership check) |
| `FINANCE` | `/dashboard/finance` (6 tab) | Ringkasan, arus kas (today/7d/30d/90d/365d), beban, rekonsiliasi, penggajian, aktivitas |
| `CUSTOMER` | `/profile` | Profil + riwayat pesanan (isolasi `userId==session`) |

Middleware `jose jwtVerify` gate di `/dashboard/*`, `/admin/*`, `/profile/*`. Cookie `ts_session` httpOnly + SameSite Lax.

---

## Architecture

```
app/
  layout.tsx              # fonts (Outfit / Plus Jakarta Sans / JetBrains Mono), SEO
  page.tsx                # Server Component — prisma.product.findMany()
  globals.css             # Warm Artisanal tokens (#FAF9F6, #FFFFFF, #E5E2DC, #1C1917, #D97706)
  login/ register/ profile/
  dashboard/owner|admin|supplier|finance|customer/
components/
  StoreClient.tsx         # cart, filters, modals, toast
  Hero.tsx / Navbar.tsx / ProductCard.tsx / ProductDetail.tsx
  CartDrawer.tsx / CheckoutModal.tsx  # VA_BCA/MANDIRI/BNI/BRI, QRIS, RETAIL_INDOMARET/ALFAMART, COD
  OrderSuccess.tsx        # invoice + VA/QRIS + auto-settle 22s/28s + manual verifikasi
  Footer.tsx
  dashboard/Shell.tsx / FinanceClient.tsx / OwnerDashboardClient.tsx
  dashboard/SupplierBahanBakuClient.tsx / AdminDashboardClient.tsx
  dashboard/PayrollManager.tsx  # penggajian berbasis User (sinkron Manajemen Tim)
  dashboard/ActivityFeed.tsx    # audit trail lintas divisi (take 30, real-time)
  ui/dashboard-4.tsx
lib/
  prisma.ts               # singleton PrismaClient
  auth.ts / authActions.ts # signSession (HS256 7d), hashPassword, OTP in-memory
  rbac.ts                 # ROLE_LABEL, DASHBOARD_ROLES
  actions.ts              # server actions (hardened v2.0: confirmOrderPayment RBAC, RawMaterial IDOR)
  payment.ts              # generateVaNumber / Qris / RetailCode
  storeAccount.ts         # BCA 8880123456 a.n. Tahu Sumedang Official
  utils.ts                # cn(), formatRupiah(), generateOrderNumber()
prisma/
  schema.prisma           # 10 model — User, Product, Order, OrderItem, Expense, RawMaterial, StockEntry, Employee(legacy), Payroll, ActivityLog
  seed.ts                 # idempotent upsert, delete order StockEntry→Payroll→RawMaterial→Order→Expense→Product→User
middleware.ts             # RBAC gate
```

**Pattern:** Server Components fetch + `force-dynamic` + `revalidatePath`; Client Components animate (`framer-motion` blur 0.28s) & `useTransition`. Tanpa `route.ts` API — semua via Server Actions.

**Ledger:** `Order.paymentStatus === 'PAID'` single source of truth. `createOrder` / `addStockEntry` / `payPayroll` atomik via `prisma.$transaction`. `Payroll @@unique [userId,month]` cegah double-pay.

---

## Design

- Warm Artisanal Light Theme: `--bg #FAF9F6`, `--card #FFFFFF`, `--border #E5E2DC`, `--text-primary #1C1917`, `--accent #D97706`, `--success #059669`.
- Glassmorphism (`backdrop-blur` + `saturate`) pada nav.
- Inline SVG noise grain, GSAP + Framer Motion micro-interactions.
- Monospace `JetBrains Mono` untuk rupiah & order number (`tabular-nums`, `break-all` anti clipping).
- Detail: `architecture_documentation.md` v2.0 (13 Okt 2026).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | dev server Turbopack |
| `npx tsc --noEmit` | typecheck (CI gate — harus 0) |
| `npx prisma db push` | sync schema (dev) |
| `npx prisma generate` | regenerasi client |
| `npx tsx prisma/seed.ts` | seed idempotent |
| `npm run build` | production build |
| `npm run lint` | eslint |

## Env

`DATABASE_URL="file:./dev.db"` — zero config. Prod ganti `provider = "postgresql"` + Neon/Supabase. `JWT_SECRET` 32+ char wajib di prod.

**Windows note:** `prisma generate` kadang `EPERM` karena lock dev server — hentikan `node` lalu ulangi.
