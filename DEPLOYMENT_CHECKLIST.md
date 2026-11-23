# Deployment Checklist

Checklist lengkap sebelum deploy ke production.

## ✅ Pre-Deployment Checklist

### 1. Supabase Setup
- [ ] Project Supabase sudah dibuat
- [ ] Database schema sudah di-push (`npx prisma db push`)
- [ ] Database sudah di-seed dengan data awal (`npm run db:seed`)
- [ ] Storage bucket `payment-proofs` sudah dibuat
- [ ] Storage bucket di-set sebagai **public**
- [ ] Storage policies sudah dikonfigurasi (optional, tapi recommended)

### 2. Environment Variables - Lokal
File `.env` sudah lengkap dengan:
- [ ] `DATABASE_URL` - Connection pooling URL dari Supabase
- [ ] `JWT_SECRET` - Random 32+ karakter
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Project URL Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon public key
- [ ] `SUPABASE_URL` - Project URL (sama dengan yang public)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role secret key
- [ ] `SUPABASE_STORAGE_BUCKET` - Nama bucket (`payment-proofs`)
- [ ] `STATIC_QRIS_PAYLOAD` - QRIS merchant payload (opsional)
- [ ] `NEXT_PUBLIC_SITE_URL` - Domain production
- [ ] `CRON_SECRET` - Random string untuk protect cron endpoint

### 3. Code & Dependencies
- [ ] Semua dependencies sudah ter-install (`npm install`)
- [ ] Package `@supabase/supabase-js` sudah ter-install
- [ ] Build lokal berhasil (`npm run build`)
- [ ] Dev server berjalan tanpa error (`npm run dev`)
- [ ] Testing manual sudah dilakukan (order, payment, upload)

### 4. Git Repository
- [ ] File `.env` **TIDAK** ter-commit (cek `.gitignore`)
- [ ] All changes sudah di-commit
- [ ] Repository sudah di-push ke GitHub/GitLab

### 5. Vercel Account
- [ ] Akun Vercel sudah dibuat
- [ ] Sudah connect dengan GitHub/GitLab account
- [ ] Billing (optional) - untuk production domains

## 🚀 Deployment Steps

### Step 1: Import Project ke Vercel
1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **Add New...** → **Project**
3. **Import Git Repository**
4. Pilih repository `tahu-sumedang-store`
5. Vercel akan auto-detect Next.js framework

### Step 2: Configure Project
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `prisma generate && next build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Step 3: Set Environment Variables
Tambahkan satu per satu (atau import dari file):

```env
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

JWT_SECRET=your_32_char_random_string

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_STORAGE_BUCKET=payment-proofs

STATIC_QRIS_PAYLOAD=00020101021126...

NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

CRON_SECRET=your_random_cron_secret
```

**Penting:**
- ✅ Pastikan `DATABASE_URL` menggunakan **connection pooling** (port 6543)
- ✅ Tambahkan parameter `?pgbouncer=true&connection_limit=1`
- ✅ Gunakan `SUPABASE_SERVICE_ROLE_KEY`, bukan anon key

### Step 4: Deploy
1. Klik **Deploy**
2. Tunggu build process selesai (~2-3 menit)
3. Vercel akan memberikan URL deployment

### Step 5: Update Site URL
1. Copy URL production (contoh: `https://tahu-sumedang-xxx.vercel.app`)
2. Di Vercel Dashboard → **Settings** → **Environment Variables**
3. Edit `NEXT_PUBLIC_SITE_URL` dengan URL yang baru
4. Klik **Save**
5. Go to **Deployments** → Klik **...** → **Redeploy**

## ✅ Post-Deployment Checklist

### 1. Verify Deployment
- [ ] Website bisa diakses di URL production
- [ ] Homepage load dengan benar
- [ ] Products tampil dengan benar
- [ ] Images load (produk, logo, dll)

### 2. Test Core Features
- [ ] Browse produk
- [ ] Search berfungsi
- [ ] Add to cart
- [ ] Checkout flow
- [ ] Payment methods tampil
- [ ] QRIS generate (jika sudah setup)
- [ ] Upload payment proof berhasil
- [ ] Check di Supabase Storage - file ter-upload

### 3. Test API Endpoints
- [ ] `/api/orders` - Create order berhasil
- [ ] `/api/orders/[id]` - Get order detail
- [ ] `/api/products` - Get products list
- [ ] `/api/cron/expire` - Protected dengan CRON_SECRET

### 4. Check Database
- [ ] Login ke Supabase Dashboard → Database
- [ ] Table sudah ada (User, Product, Order, dll)
- [ ] Data seed sudah ada (kalau di-seed)
- [ ] New orders masuk ke database

### 5. Check Storage
- [ ] Login ke Supabase Dashboard → Storage
- [ ] Bucket `payment-proofs` ada
- [ ] Folder `payments/` terbuat otomatis saat upload
- [ ] Files bisa diakses via public URL

### 6. Check Logs
- [ ] Vercel Dashboard → Deployments → Function Logs - tidak ada error
- [ ] Supabase Dashboard → Logs → tidak ada error database
- [ ] Browser Console → tidak ada JavaScript error

### 7. Performance
- [ ] Lighthouse score > 80 (optional)
- [ ] Page load time < 3 detik
- [ ] Images dioptimasi (Next.js Image component)

### 8. Security
- [ ] `.env` file tidak ter-commit di Git
- [ ] `SERVICE_ROLE_KEY` tidak exposed di client
- [ ] CRON endpoint protected dengan `CRON_SECRET`
- [ ] Supabase RLS policies aktif (optional tapi recommended)

## 🔧 Troubleshooting

### Build Failed
**Error**: "Can't reach database server"
- ✅ Pastikan `DATABASE_URL` benar
- ✅ Gunakan connection pooling URL (port 6543)
- ✅ Tambahkan `?pgbouncer=true&connection_limit=1`

**Error**: "Module not found: Can't resolve '@supabase/supabase-js'"
- ✅ Pastikan package sudah ada di `package.json`
- ✅ Coba redeploy atau clear build cache

**Error**: "Invalid environment variable"
- ✅ Cek semua env vars sudah diisi
- ✅ Tidak ada typo di nama variabel
- ✅ Tidak ada spasi di awal/akhir value

### Runtime Errors
**Error 500 di API routes**
- ✅ Check Function Logs di Vercel
- ✅ Pastikan Prisma client generated: `prisma generate` di build command
- ✅ Check database connection

**Upload payment proof gagal**
- ✅ Pastikan bucket `payment-proofs` ada
- ✅ Pastikan bucket public
- ✅ Cek `SUPABASE_SERVICE_ROLE_KEY` benar

**QRIS tidak generate**
- ✅ Pastikan `STATIC_QRIS_PAYLOAD` sudah diisi
- ✅ Payload harus valid EMVCo format

## 📊 Monitoring

Setup monitoring untuk production:

### Vercel
- [ ] Enable **Vercel Analytics** (Settings → Analytics)
- [ ] Enable **Speed Insights**
- [ ] Setup **Log Drains** untuk error monitoring (optional)

### Supabase
- [ ] Enable **Database Logs**
- [ ] Monitor **API Usage** (Settings → Usage)
- [ ] Setup **Webhooks** untuk notifications (optional)

### Uptime Monitoring (Optional)
- [ ] Setup UptimeRobot atau Pingdom
- [ ] Monitor homepage & API endpoints
- [ ] Alert via email/Slack jika down

## 🔄 Continuous Deployment

Setelah setup selesai, setiap push ke `main` branch akan auto-deploy:

```bash
git add .
git commit -m "Update: fitur baru"
git push origin main
```

Vercel akan otomatis:
1. Build project
2. Run `prisma generate`
3. Deploy ke production
4. Update URL

## 📝 Next Steps

Setelah deployment sukses:

- [ ] Setup **custom domain** di Vercel (optional)
- [ ] Configure **SSL certificate** (auto by Vercel)
- [ ] Setup **email notifications** untuk order baru
- [ ] Enable **Supabase Auth** untuk customer login (optional)
- [ ] Integrate **payment gateway** (Midtrans, Xendit, dll)
- [ ] Setup **Google Analytics** atau **Mixpanel**
- [ ] Add **sitemap.xml** dan **robots.txt** (sudah ada di Next.js)
- [ ] Submit to **Google Search Console**
- [ ] Setup **social media meta tags** (OG, Twitter Card)

## 🎉 You're Live!

Selamat! Toko Tahu Sumedang Anda sudah online! 🚀

Share URL production Anda:
- 📱 Social media
- 💼 Business cards
- 📧 Email customers
- 🌐 Google My Business

---

**Need help?** Check:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
