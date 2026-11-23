# 📊 Visual Setup Guide

Panduan visual untuk setup Tahu Sumedang Store dengan Supabase.

## 🗺️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER / BROWSER                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VERCEL EDGE NETWORK                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │   Static       │  │   SSR Pages    │  │   API Routes   │   │
│  │   Pages        │  │   (Server)     │  │   (Serverless) │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE CLOUD                              │
│                                                                   │
│  ┌────────────────────────┐      ┌────────────────────────┐    │
│  │   PostgreSQL Database  │      │    Storage (S3-like)   │    │
│  │   - Products           │      │    - payment-proofs/   │    │
│  │   - Orders             │      │    - uploads/          │    │
│  │   - Users              │      │                        │    │
│  │   + Connection Pooler  │      │    + CDN Delivery      │    │
│  └────────────────────────┘      └────────────────────────┘    │
│                                                                   │
│  ┌────────────────────────┐      ┌────────────────────────┐    │
│  │   Realtime (WebSocket) │      │    Auth (Optional)     │    │
│  │   - Live updates       │      │    - JWT/OAuth         │    │
│  └────────────────────────┘      └────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow: User Makes Order

```
┌──────────┐
│  USER    │
│ (Browser)│
└────┬─────┘
     │ 1. Add to Cart
     ▼
┌──────────────┐
│   Next.js    │
│  Client-side │
│  (React)     │
└────┬─────────┘
     │ 2. Submit Order
     ▼
┌──────────────┐
│ API Route    │
│ /api/orders  │
└────┬─────────┘
     │ 3. Insert to DB
     ▼
┌──────────────┐
│  Supabase    │
│  PostgreSQL  │
│  via Prisma  │
└────┬─────────┘
     │ 4. Return order ID
     ▼
┌──────────────┐
│   Show       │
│   Success    │
│   + Invoice  │
└──────────────┘
```

## 📤 Data Flow: Upload Payment Proof

```
┌──────────┐
│  USER    │
│  Uploads │
│   Image  │
└────┬─────┘
     │ 1. Select file
     ▼
┌──────────────────┐
│   <input file>   │
│   FormData       │
└────┬─────────────┘
     │ 2. POST to API
     ▼
┌──────────────────┐
│   API Route      │
│   /api/upload    │
│   (Server-side)  │
└────┬─────────────┘
     │ 3. Upload with
     │    Service Role Key
     ▼
┌──────────────────┐
│   Supabase       │
│   Storage        │
│   payment-proofs │
└────┬─────────────┘
     │ 4. Return public URL
     ▼
┌──────────────────┐
│   Update Order   │
│   paymentProofUrl│
└────┬─────────────┘
     │ 5. Show preview
     ▼
┌──────────────────┐
│   USER sees      │
│   uploaded image │
└──────────────────┘
```

## 🗂️ Project Structure

```
tahu-sumedang-store/
│
├── 📱 app/                      # Next.js App Router
│   ├── (routes)/
│   │   ├── page.tsx            # Homepage (Server Component)
│   │   ├── login/              # Auth pages
│   │   ├── register/
│   │   ├── profile/            # Customer dashboard
│   │   └── dashboard/          # Role-based dashboards
│   │       ├── owner/
│   │       ├── admin/
│   │       ├── finance/
│   │       └── supplier/
│   │
│   ├── api/                    # API Routes (Serverless)
│   │   ├── orders/
│   │   ├── products/
│   │   ├── upload/
│   │   └── cron/
│   │
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
│
├── 🧩 components/              # React Components
│   ├── StoreClient.tsx         # Main e-commerce client
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── CartDrawer.tsx
│   └── CheckoutModal.tsx
│
├── 🛠️ lib/                     # Utilities & Config
│   ├── supabase.ts            # ⭐ Supabase client
│   ├── prisma.ts              # Prisma client
│   ├── auth.ts                # JWT helpers
│   └── utils.ts
│
├── 🗄️ prisma/                  # Database
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
│
├── 📝 scripts/                 # Helper scripts
│   └── generate-secrets.js    # Generate JWT/CRON secrets
│
├── 📚 docs/                    # Documentation
│   ├── SUPABASE_CREDENTIALS.md
│   ├── TROUBLESHOOTING.md
│   ├── DEPLOYMENT_FLOW.md
│   ├── MIGRATE_TO_SUPABASE.md
│   └── VISUAL_GUIDE.md        # ← You are here
│
├── 📄 Config Files
│   ├── .env                   # 🔒 Secrets (DON'T COMMIT!)
│   ├── .env.example           # Template
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── vercel.json            # Vercel config
│
└── 📖 Documentation
    ├── START_HERE.md          # ⭐ Start here!
    ├── QUICK_START.md         # Quick setup guide
    ├── SUPABASE_SETUP.md      # Detailed Supabase guide
    ├── DEPLOYMENT_CHECKLIST.md
    └── README.md              # Main readme
```

## 🔑 Environment Variables Map

```
┌──────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT VARIABLES                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  CLIENT-SIDE (Exposed to Browser)                            │
│  ├─ NEXT_PUBLIC_SUPABASE_URL ───────┐                       │
│  ├─ NEXT_PUBLIC_SUPABASE_ANON_KEY ──┼─► Safe to expose     │
│  └─ NEXT_PUBLIC_SITE_URL ───────────┘                       │
│                                                               │
│  SERVER-SIDE ONLY (Secret!)                                  │
│  ├─ DATABASE_URL ────────────────────► Prisma connection    │
│  ├─ SUPABASE_URL ────────────────────► (same as public)     │
│  ├─ SUPABASE_SERVICE_ROLE_KEY ───────► 🔒 ADMIN ACCESS!    │
│  ├─ JWT_SECRET ──────────────────────► Auth token signing   │
│  └─ CRON_SECRET ─────────────────────► Protect cron jobs    │
│                                                               │
│  OPTIONAL                                                     │
│  ├─ STATIC_QRIS_PAYLOAD ─────────────► QRIS merchant code   │
│  └─ SUPABASE_STORAGE_BUCKET ─────────► Bucket name          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 🗺️ Database Schema Relationship

```
┌─────────┐           ┌──────────┐           ┌─────────────┐
│  User   │◄─────────▶│  Order   │◄─────────▶│  OrderItem  │
└─────────┘           └──────────┘           └─────────────┘
    │                       │                       │
    │                       │                       │
    │ 1:N                   │ 1:N                   │ N:1
    │                       │                       │
    ▼                       ▼                       ▼
┌─────────┐           ┌──────────┐           ┌─────────────┐
│ Review  │           │          │           │   Product   │
└─────────┘           │          │           └─────────────┘
                      │          │                 │
┌─────────┐           │          │                 │ 1:N
│ Payroll │◄──────────┤          │                 │
└─────────┘           │          │                 ▼
    ▲                 │          │           ┌─────────────┐
    │                 │          │           │   Review    │
    │ 1:1             │          │           └─────────────┘
    │                 │          │
┌─────────┐           │          │           ┌─────────────┐
│Employee │           │          │           │RawMaterial  │
└─────────┘           │          │           └─────────────┘
                      │          │                 │
                      │          │                 │ 1:N
                      │          │                 │
                      │          │                 ▼
                      │          │           ┌─────────────┐
                      │          │           │ StockEntry  │
                      │          │           └─────────────┘
                      │          │
                      ▼          ▼
              ┌────────────────────┐
              │   ActivityLog      │
              │   Expense          │
              └────────────────────┘

Legend:
─────► One-to-Many relationship
◄────► Many-to-Many or bidirectional
```

## 🌐 API Routes Map

```
/api/
├── auth/
│   ├── login          POST    # Authenticate user
│   ├── register       POST    # Create new user
│   └── logout         POST    # Clear session
│
├── orders/
│   ├── /              GET     # List orders (filtered by role)
│   ├── /              POST    # Create new order
│   ├── [id]           GET     # Get order detail
│   └── [id]/verify    POST    # Verify payment (admin only)
│
├── products/
│   ├── /              GET     # List all products
│   ├── /              POST    # Create product (admin)
│   ├── [id]           GET     # Get product detail
│   ├── [id]           PUT     # Update product (admin)
│   └── [id]           DELETE  # Delete product (admin)
│
├── upload/
│   └── payment-proof  POST    # Upload payment proof image
│
├── dashboard/
│   ├── owner          GET     # Owner dashboard data
│   ├── admin          GET     # Admin dashboard data
│   ├── finance        GET     # Finance dashboard data
│   └── supplier       GET     # Supplier dashboard data
│
└── cron/
    └── expire         GET     # Expire pending orders (protected)
```

## 🔐 Authentication Flow

```
┌──────────────┐
│  User Login  │
└──────┬───────┘
       │ Email + Password
       ▼
┌──────────────────┐
│  POST /api/login │
└──────┬───────────┘
       │ 1. Verify credentials
       │ 2. Generate JWT
       ▼
┌──────────────────┐
│   Set Cookie     │
│   ts_session     │
│   (httpOnly)     │
└──────┬───────────┘
       │ 3. Return user data
       ▼
┌──────────────────┐
│  Redirect to     │
│  Dashboard       │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Middleware      │
│  verifies JWT    │
│  on each request │
└──────────────────┘
```

## 📊 Role-Based Access Control

```
┌────────────────────────────────────────────────────────────┐
│                        RBAC Matrix                          │
├────────────┬──────────┬──────────┬──────────┬─────────────┤
│   Action   │   Owner  │  Admin   │ Finance  │  Customer   │
├────────────┼──────────┼──────────┼──────────┼─────────────┤
│ View all   │    ✅    │    ✅    │    ✅    │  ❌ (own)   │
│ orders     │          │          │          │             │
├────────────┼──────────┼──────────┼──────────┼─────────────┤
│ Create     │    ✅    │    ✅    │    ❌    │     ✅      │
│ order      │          │          │          │             │
├────────────┼──────────┼──────────┼──────────┼─────────────┤
│ Manage     │    ✅    │    ✅    │    ❌    │     ❌      │
│ products   │          │          │          │             │
├────────────┼──────────┼──────────┼──────────┼─────────────┤
│ View       │    ✅    │    ❌    │    ✅    │     ❌      │
│ finance    │          │          │          │             │
├────────────┼──────────┼──────────┼──────────┼─────────────┤
│ Manage     │    ✅    │    ❌    │    ✅    │     ❌      │
│ payroll    │          │          │          │             │
├────────────┼──────────┼──────────┼──────────┼─────────────┤
│ View       │    ✅    │    ✅    │    ✅    │     ✅      │
│ profile    │          │          │          │             │
└────────────┴──────────┴──────────┴──────────┴─────────────┘
```

## 🚀 Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ git push origin main
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      GITHUB REPOSITORY                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Webhook trigger
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL BUILD                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Install dependencies    (npm install)             │  │
│  │ 2. Generate Prisma client  (prisma generate)         │  │
│  │ 3. Build Next.js           (next build)              │  │
│  │ 4. Optimize & bundle                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Deploy
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   VERCEL EDGE NETWORK                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Static assets → CDN (Worldwide)                      │  │
│  │ API Routes → Serverless Functions (US-East-1)        │  │
│  │ Pages → Edge Runtime (Closest to user)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Connect to
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                       │
│  - PostgreSQL (Asia Southeast)                              │
│  - Connection Pooler (PgBouncer)                            │
└─────────────────────────────────────────────────────────────┘
```

## 📈 Scaling Architecture

```
         User Traffic
              │
              ▼
┌──────────────────────────┐
│   Vercel Edge (CDN)      │  ◄── Automatic global distribution
│   - Cache static assets  │      No config needed
│   - SSL/TLS auto         │
└──────────────────────────┘
              │
              ▼
┌──────────────────────────┐
│   Serverless Functions   │  ◄── Auto-scale 0 → ∞
│   - Per-request billing  │      Pay for execution time only
│   - 10s timeout (hobby)  │
└──────────────────────────┘
              │
              ▼
┌──────────────────────────┐
│   PgBouncer (Pooler)     │  ◄── Handle 1000+ connections
│   - Connection pooling   │      with 10 actual DB connections
│   - Transaction mode     │
└──────────────────────────┘
              │
              ▼
┌──────────────────────────┐
│   PostgreSQL             │  ◄── Supabase free tier:
│   - Persistent data      │      - 500MB database
│   - Automatic backups    │      - Daily backups
└──────────────────────────┘      - 2 CPU cores
```

---

## 📚 More Visual Guides

- **Setup Flow**: [DEPLOYMENT_FLOW.md](./DEPLOYMENT_FLOW.md)
- **Database Schema**: Open Prisma Studio (`npx prisma studio`)
- **API Testing**: Use `curl` or Postman with examples in docs

---

**Visual learner?** These diagrams should help you understand how everything connects! 🎨
