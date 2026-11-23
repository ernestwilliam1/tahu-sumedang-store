# 🚀 Deployment Flow Diagram

Visual guide untuk deployment Tahu Sumedang Store ke production.

## 📋 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT SETUP                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Buat Supabase   │
                    │     Project      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Setup .env File │
                    │  - Database URL  │
                    │  - Supabase Keys │
                    │  - JWT Secret    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  prisma db push  │
                    │  npm run db:seed │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   npm run dev    │
                    │   Test Locally   │
                    └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCTION DEPLOY                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   git push to    │
                    │     GitHub       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Import Project  │
                    │   to Vercel      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Add Environment │
                    │    Variables     │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │      Deploy      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Update Site URL │
                    │    & Redeploy    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   🎉 LIVE! 🎉   │
                    └──────────────────┘
```

## 🔄 Detailed Flow

### Phase 1: Supabase Setup

```
Supabase Dashboard
    │
    ├─► Create Project
    │       │
    │       ├─► Project Name: tahu-sumedang-store
    │       ├─► Database Password: [strong password]
    │       └─► Region: Southeast Asia
    │
    ├─► Get API Keys (Settings → API)
    │       │
    │       ├─► Project URL
    │       ├─► Anon Key (public)
    │       └─► Service Role Key (secret)
    │
    ├─► Get Database URL (Settings → Database)
    │       │
    │       ├─► Connection Pooling (production)
    │       └─► Direct Connection (development)
    │
    └─► Create Storage Bucket (Storage)
            │
            └─► Bucket Name: payment-proofs
                └─► Public: ✅
```

### Phase 2: Local Development

```
Terminal
    │
    ├─► npm install
    │       └─► Install @supabase/supabase-js
    │
    ├─► cp .env.example .env
    │       └─► Fill all credentials
    │
    ├─► npm run generate:secrets
    │       └─► Get JWT_SECRET & CRON_SECRET
    │
    ├─► npx prisma db push
    │       └─► Create tables in Supabase
    │
    ├─► npm run db:seed
    │       └─► Insert sample data
    │
    └─► npm run dev
            └─► Test at http://localhost:3000
                    │
                    ├─► Browse products ✅
                    ├─► Add to cart ✅
                    ├─► Checkout ✅
                    └─► Upload payment proof ✅
```

### Phase 3: Git & GitHub

```
Terminal
    │
    ├─► git add .
    │
    ├─► git commit -m "Setup Supabase integration"
    │
    └─► git push origin main
            │
            └─► Code now on GitHub ✅
```

### Phase 4: Vercel Deployment

```
Vercel Dashboard
    │
    ├─► Add New Project
    │       └─► Import from GitHub
    │
    ├─► Configure Project
    │       │
    │       ├─► Framework: Next.js (auto-detected)
    │       ├─► Root Directory: ./
    │       └─► Build Command: default
    │
    ├─► Add Environment Variables
    │       │
    │       ├─► DATABASE_URL (connection pooling!)
    │       ├─► JWT_SECRET
    │       ├─► NEXT_PUBLIC_SUPABASE_URL
    │       ├─► NEXT_PUBLIC_SUPABASE_ANON_KEY
    │       ├─► SUPABASE_URL
    │       ├─► SUPABASE_SERVICE_ROLE_KEY
    │       ├─► SUPABASE_STORAGE_BUCKET
    │       ├─► STATIC_QRIS_PAYLOAD
    │       ├─► NEXT_PUBLIC_SITE_URL (temp)
    │       └─► CRON_SECRET
    │
    ├─► Deploy
    │       │
    │       └─► Wait 2-3 minutes...
    │
    ├─► Get Deployment URL
    │       └─► https://tahu-sumedang-xxx.vercel.app
    │
    └─► Update NEXT_PUBLIC_SITE_URL
            │
            ├─► Edit environment variable
            └─► Redeploy
                    │
                    └─► 🎉 Production Ready!
```

### Phase 5: Post-Deployment Verification

```
Browser
    │
    ├─► Visit production URL
    │       │
    │       ├─► Homepage loads ✅
    │       ├─► Products display ✅
    │       └─► Images load ✅
    │
    ├─► Test Features
    │       │
    │       ├─► Add to cart ✅
    │       ├─► Checkout flow ✅
    │       ├─► Payment methods ✅
    │       └─► Upload proof ✅
    │
    └─► Check Supabase Storage
            └─► Files appear in payment-proofs/ ✅

Vercel Dashboard
    │
    └─► Check Function Logs
            └─► No errors ✅

Supabase Dashboard
    │
    ├─► Check Database
    │       └─► New orders appear ✅
    │
    └─► Check Storage
            └─► Uploaded files appear ✅
```

## 🔀 Alternative Flows

### If You Have Existing SQLite Data

```
Current Setup (SQLite)
    │
    ├─► Backup data
    │       └─► cp prisma/dev.db prisma/dev.db.backup
    │
    ├─► Follow: docs/MIGRATE_TO_SUPABASE.md
    │       │
    │       ├─► Option 1: Fresh start (seed new data)
    │       └─► Option 2: Migrate existing data
    │
    └─► Continue normal flow
```

### If Deployment Fails

```
Build Error
    │
    ├─► Check Vercel Logs
    │       │
    │       ├─► Database connection error?
    │       │       └─► Verify DATABASE_URL
    │       │
    │       ├─► Missing env variables?
    │       │       └─► Add missing vars
    │       │
    │       └─► Prisma error?
    │               └─► Check build command
    │
    └─► Redeploy
            └─► Fixed! ✅

Runtime Error
    │
    ├─► Check Function Logs
    │       │
    │       ├─► API route error?
    │       │       └─► Check SERVER_ROLE_KEY
    │       │
    │       └─► Storage error?
    │               └─► Check bucket & policies
    │
    └─► Fix & push changes
            └─► Auto-redeploy ✅
```

## 📊 Data Flow in Production

```
User Request
    │
    ▼
Next.js (Vercel Edge)
    │
    ├─► Static Pages (SSG)
    │       └─► Served from Edge Cache
    │
    ├─► Dynamic Pages (SSR)
    │       │
    │       └─► Fetch from Supabase PostgreSQL
    │               │
    │               └─► Connection Pooling (PgBouncer)
    │
    └─► API Routes
            │
            ├─► /api/orders
            │       └─► Write to Supabase DB
            │
            ├─► /api/products
            │       └─► Read from Supabase DB
            │
            └─► /api/upload
                    └─► Upload to Supabase Storage
                            │
                            └─► payment-proofs bucket
```

## 🔄 Continuous Deployment Flow

```
Local Development
    │
    ├─► Make changes
    │       └─► Edit code
    │
    ├─► Test locally
    │       └─► npm run dev
    │
    ├─► Commit & push
    │       │
    │       ├─► git add .
    │       ├─► git commit -m "..."
    │       └─► git push origin main
    │
    └─► Vercel Auto-Deploy
            │
            ├─► Detect push
            ├─► Build project
            ├─► Run tests
            └─► Deploy to production
                    │
                    └─► Live in ~2 minutes! 🚀
```

## 🎯 Success Criteria Checklist

After following the flow, verify:

✅ **Local Development**
- [ ] npm run dev works
- [ ] Database connected
- [ ] All features working

✅ **Supabase**
- [ ] Project created
- [ ] Tables exist
- [ ] Storage bucket created
- [ ] Data can be inserted

✅ **Vercel Deployment**
- [ ] Project deployed
- [ ] No build errors
- [ ] Environment variables set
- [ ] Site URL updated

✅ **Production Testing**
- [ ] Homepage loads
- [ ] Products display
- [ ] Can create order
- [ ] Can upload payment proof
- [ ] No console errors

✅ **Monitoring**
- [ ] Vercel logs clean
- [ ] Supabase logs clean
- [ ] No 500 errors

---

## 📖 Reference

- **Quick setup**: [QUICK_START.md](../QUICK_START.md)
- **Detailed guide**: [SUPABASE_SETUP.md](../SUPABASE_SETUP.md)
- **Deployment checklist**: [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md)
- **Get credentials**: [SUPABASE_CREDENTIALS.md](./SUPABASE_CREDENTIALS.md)

---

**Follow this flow step by step and you'll have a production-ready e-commerce store in less than 30 minutes!** 🚀
