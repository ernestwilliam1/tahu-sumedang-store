# 🔧 Troubleshooting Guide

Solusi untuk masalah umum saat setup dan deployment Tahu Sumedang Store.

## 📑 Daftar Isi

- [Setup & Installation](#setup--installation)
- [Database Connection](#database-connection)
- [Supabase Issues](#supabase-issues)
- [Vercel Deployment](#vercel-deployment)
- [Runtime Errors](#runtime-errors)
- [Performance Issues](#performance-issues)

---

## Setup & Installation

### ❌ Error: "Cannot find module '@supabase/supabase-js'"

**Penyebab:** Package belum ter-install

**Solusi:**
```bash
# Pastikan di directory project
npm install @supabase/supabase-js

# Jika masih error, hapus node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error: "Scripts are disabled on this system" (PowerShell)

**Penyebab:** PowerShell execution policy

**Solusi 1 - Pakai Command Prompt:**
1. Tekan `Win + R`
2. Ketik `cmd` dan Enter
3. `cd C:\Users\Ernest\tahu-sumedang-store`
4. Jalankan command npm

**Solusi 2 - Pakai Git Bash:**
Buka Git Bash dan jalankan command di sana

**Solusi 3 - Enable PowerShell:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ❌ Error: "Module not found: Can't resolve 'lib/supabase'"

**Penyebab:** TypeScript belum compile atau path salah

**Solusi:**
```bash
# Restart dev server
npm run dev

# Atau clear Next.js cache
rm -rf .next
npm run dev
```

---

## Database Connection

### ❌ Error: "Can't reach database server"

**Penyebab:** DATABASE_URL salah atau database tidak aktif

**Solusi:**

1. **Cek DATABASE_URL format:**
```env
# SALAH - tanpa pgbouncer parameter
DATABASE_URL="postgresql://postgres:password@aws-0-region.pooler.supabase.com:6543/postgres"

# BENAR - dengan pgbouncer parameter
DATABASE_URL="postgresql://postgres:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

2. **Cek password:** Pastikan password tidak ada typo
3. **Cek Supabase status:** Buka Dashboard → pastikan status "Healthy"

### ❌ Error: "Too many connections"

**Penyebab:** Tidak pakai connection pooling

**Solusi:**

**Untuk Production (Vercel):**
Pastikan pakai **Connection Pooling** URL (port **6543**):
```env
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Untuk Development Lokal:**
Pakai **Direct Connection** (port **5432**):
```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

### ❌ Error: "Prepared statement already exists"

**Penyebab:** PgBouncer mode salah

**Solusi:**

Pastikan parameter `pgbouncer=true` ada di connection string:
```env
DATABASE_URL="...?pgbouncer=true&connection_limit=1"
```

### ❌ Error: "password authentication failed"

**Penyebab:** Password salah di connection string

**Solusi:**

1. Reset password di Supabase:
   - Dashboard → Settings → Database
   - Klik "Reset database password"
   - Copy password baru

2. Update connection string dengan password baru

3. URL encode password jika ada special characters:
   ```
   # Password: p@ssw0rd!
   # URL encoded: p%40ssw0rd%21
   ```

---

## Supabase Issues

### ❌ Error: "Invalid API key"

**Penyebab:** API key salah atau terbalik

**Solusi:**

1. **Cek key yang benar:**
   - Settings → API
   - `anon public` → untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → untuk `SUPABASE_SERVICE_ROLE_KEY`

2. **Copy ulang:**
   - Pastikan copy **full key** (sangat panjang)
   - Jangan ada spasi/newline
   - Jangan terbalik anon dengan service role

3. **Regenerate key** jika perlu:
   - Settings → API → Reset key

### ❌ Error: "Bucket not found"

**Penyebab:** Storage bucket belum dibuat

**Solusi:**

1. Buka Supabase Dashboard → Storage
2. Klik "New bucket"
3. Nama: `payment-proofs` (atau sesuai .env)
4. **Public bucket**: ✅ Centang
5. Create

**Verify:**
```env
# Pastikan nama sama
SUPABASE_STORAGE_BUCKET="payment-proofs"
```

### ❌ Error: "new row violates row-level security policy"

**Penyebab:** RLS (Row Level Security) aktif tanpa policy

**Solusi 1 - Disable RLS (Development):**
```sql
-- Di Supabase SQL Editor
ALTER TABLE "Order" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" DISABLE ROW LEVEL SECURITY;
-- Untuk semua tabel
```

**Solusi 2 - Pakai Service Role Key (Recommended):**
Pastikan server-side code pakai `supabaseAdmin` (bukan `supabase`):
```typescript
import { supabaseAdmin } from '@/lib/supabase'

// BENAR - bypass RLS
await supabaseAdmin.storage.from('payment-proofs').upload(...)

// SALAH - kena RLS
await supabase.storage.from('payment-proofs').upload(...)
```

### ❌ Error: "Failed to upload file to storage"

**Penyebab:** Storage policy atau key salah

**Solusi:**

1. **Cek bucket public:**
   - Storage → payment-proofs → Settings
   - Pastikan "Public" ON

2. **Cek service role key:**
   ```typescript
   // Pastikan pakai supabaseAdmin
   import { supabaseAdmin } from '@/lib/supabase'
   await supabaseAdmin.storage.from('payment-proofs').upload(...)
   ```

3. **Cek logs:**
   - Supabase Dashboard → Logs → Storage logs

---

## Vercel Deployment

### ❌ Error: "Build failed - Prisma generate"

**Penyebab:** Prisma client tidak ter-generate

**Solusi:**

1. **Pastikan build command benar:**
   ```json
   // package.json
   {
     "scripts": {
       "build": "prisma generate && next build"
     }
   }
   ```

2. **Pastikan postinstall ada:**
   ```json
   {
     "scripts": {
       "postinstall": "prisma generate"
     }
   }
   ```

3. **Clear build cache di Vercel:**
   - Deployments → ... → Redeploy
   - Centang "Clear build cache"

### ❌ Error: "Environment variable not found"

**Penyebab:** Env var belum di-set di Vercel

**Solusi:**

1. Vercel Dashboard → Settings → Environment Variables
2. Tambahkan semua dari file `.env` lokal
3. **Penting:** Tambahkan untuk **Production**, **Preview**, dan **Development**
4. Redeploy

**Checklist env vars wajib:**
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] SUPABASE_STORAGE_BUCKET
- [ ] NEXT_PUBLIC_SITE_URL
- [ ] CRON_SECRET

### ❌ Error: "Function execution timeout"

**Penyebab:** Database query terlalu lama

**Solusi:**

1. **Optimize query:**
   ```typescript
   // LAMBAT
   const orders = await prisma.order.findMany({
     include: { items: { include: { product: true } } }
   })
   
   // LEBIH CEPAT - select only needed fields
   const orders = await prisma.order.findMany({
     select: {
       id: true,
       orderNumber: true,
       items: { 
         select: { 
           quantity: true,
           product: { select: { name: true } }
         }
       }
     }
   })
   ```

2. **Pakai connection pooling:**
   Pastikan `?pgbouncer=true` di DATABASE_URL

3. **Add timeout:**
   ```typescript
   const prisma = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL,
       },
     },
     // Add timeout
     __internal: {
       engine: {
         connectionTimeout: 10000, // 10 seconds
       },
     },
   })
   ```

### ❌ Error: "Internal Server Error (500)"

**Penyebab:** Runtime error di API route

**Solusi:**

1. **Check Function Logs:**
   - Vercel Dashboard → Deployments → [deployment] → Functions
   - Lihat error message lengkap

2. **Common causes:**
   - Database connection error → Cek DATABASE_URL
   - Missing env variable → Cek Vercel env vars
   - Prisma not generated → Cek build script
   - Storage error → Cek Supabase keys

3. **Add error logging:**
   ```typescript
   try {
     // Your code
   } catch (error) {
     console.error('Detailed error:', error)
     return Response.json({ error: error.message }, { status: 500 })
   }
   ```

---

## Runtime Errors

### ❌ Error: "Invalid token" di login

**Penyebab:** JWT_SECRET salah atau tidak diset

**Solusi:**

1. **Generate JWT secret:**
   ```bash
   npm run generate:secrets
   ```

2. **Set di .env:**
   ```env
   JWT_SECRET="your_32_char_random_string"
   ```

3. **Set di Vercel:**
   - Settings → Environment Variables
   - Add JWT_SECRET
   - Redeploy

### ❌ Upload payment proof gagal

**Penyebab:** Bucket, policy, atau key issues

**Solusi:**

1. **Verify bucket exists:**
   - Supabase Dashboard → Storage
   - Pastikan `payment-proofs` ada

2. **Verify bucket public:**
   - Bucket settings → Public ON

3. **Verify using service role:**
   ```typescript
   // ✅ BENAR
   import { supabaseAdmin } from '@/lib/supabase'
   await supabaseAdmin.storage.from('payment-proofs').upload(...)
   
   // ❌ SALAH
   import { supabase } from '@/lib/supabase'
   await supabase.storage.from('payment-proofs').upload(...)
   ```

4. **Check file size:**
   - Default max: 50MB
   - Increase jika perlu di Storage settings

### ❌ QRIS tidak generate

**Penyebab:** STATIC_QRIS_PAYLOAD tidak diset atau invalid

**Solusi:**

1. **Check env variable:**
   ```env
   STATIC_QRIS_PAYLOAD="00020101021126..."
   ```

2. **Validate payload:**
   - Harus EMVCo format
   - Minimal 100+ karakter
   - Dapatkan dari bank/payment provider

3. **Test payload:**
   ```bash
   npm run test
   ```

### ❌ Images tidak load

**Penyebab:** Next.js Image domain not configured atau path salah

**Solusi:**

1. **Add Supabase domain:**
   ```typescript
   // next.config.ts
   module.exports = {
     images: {
       remotePatterns: [
         {
           protocol: 'https',
           hostname: '*.supabase.co',
         },
       ],
     },
   }
   ```

2. **Check image path:**
   ```typescript
   // ✅ BENAR - absolute URL
   <Image src="https://xxx.supabase.co/storage/v1/object/public/..." />
   
   // ❌ SALAH - relative path
   <Image src="/storage/image.jpg" />
   ```

---

## Performance Issues

### 🐌 Slow page load

**Penyebab:** Database query tidak optimal

**Solusi:**

1. **Add database indexes:**
   ```prisma
   // prisma/schema.prisma
   model Order {
     orderNumber String @unique
     userId Int
     
     @@index([userId])
     @@index([createdAt])
   }
   ```

2. **Use pagination:**
   ```typescript
   const products = await prisma.product.findMany({
     take: 20, // limit
     skip: page * 20, // offset
   })
   ```

3. **Enable caching:**
   ```typescript
   export const revalidate = 60 // Cache for 60 seconds
   
   export default async function ProductsPage() {
     const products = await prisma.product.findMany()
     return <div>...</div>
   }
   ```

### 🐌 Slow image load

**Penyebab:** Images tidak dioptimasi

**Solusi:**

1. **Use Next.js Image:**
   ```typescript
   import Image from 'next/image'
   
   <Image 
     src={product.image}
     alt={product.name}
     width={300}
     height={300}
     loading="lazy"
   />
   ```

2. **Compress images:**
   - Gunakan WebP format
   - Max size: 500KB per image

---

## 🆘 Masih Belum Terselesaikan?

### 1. Check Logs

**Vercel:**
- Dashboard → Deployments → [deployment] → Functions → View logs

**Supabase:**
- Dashboard → Logs → Database / Storage / API

**Browser:**
- F12 → Console → Network tab

### 2. Debug Mode

Enable debug di development:
```env
# .env
DEBUG=*
NODE_ENV=development
```

### 3. Test Components

Test satu per satu:
```bash
# Test database
npx prisma studio

# Test API
curl https://your-app.vercel.app/api/products

# Test storage
# Upload file via Supabase Dashboard → Storage
```

### 4. Community Resources

- [Supabase Discord](https://discord.supabase.com)
- [Vercel Discord](https://vercel.com/discord)
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [Prisma Discord](https://discord.gg/prisma)

### 5. Fresh Start

Jika semua gagal, mulai dari awal:
```bash
# 1. Backup dulu
cp .env .env.backup
cp -r prisma prisma.backup

# 2. Clean install
rm -rf node_modules .next
npm install

# 3. Reset database
# Di Supabase SQL Editor:
# DROP SCHEMA public CASCADE;
# CREATE SCHEMA public;

# 4. Repush schema
npx prisma db push
npm run db:seed

# 5. Test
npm run dev
```

---

## 📚 Reference Docs

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)

---

**Tidak menemukan solusi?** Buat issue di GitHub repository dengan detail:
- Error message lengkap
- Steps to reproduce
- Environment (local/Vercel)
- Screenshots jika perlu
