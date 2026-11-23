# Setup Supabase untuk Tahu Sumedang Store

Panduan lengkap menghubungkan project ini dengan Supabase database dan storage.

## 1. Install Dependencies

Jalankan command berikut untuk install Supabase client:

```bash
npm install @supabase/supabase-js
```

## 2. Setup Database di Supabase

### A. Buat Project di Supabase
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik "New Project"
3. Isi nama project, database password, dan pilih region terdekat
4. Tunggu project selesai dibuat (~2 menit)

### B. Copy Connection String
1. Buka project Anda
2. Go to **Settings** → **Database**
3. Scroll ke bagian **Connection string**
4. Copy **Connection pooling** string (untuk production)
   - Format: `postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres`
5. Copy juga **Direct connection** string (untuk local development & migration)
   - Format: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`

### C. Setup Environment Variables
1. Copy file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

2. Isi variabel Supabase di file `.env`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_STORAGE_BUCKET="payment-proofs"

# Database URL - gunakan Connection pooling untuk production
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Untuk migration lokal, gunakan Direct connection:
# DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

**Cara mendapatkan keys:**
- **SUPABASE_URL & ANON_KEY**: Settings → API → Project URL & anon public key
- **SERVICE_ROLE_KEY**: Settings → API → service_role key (secret!)

### D. Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy hasilnya ke `JWT_SECRET` di file `.env`

## 3. Setup Database Schema dengan Prisma

### A. Push Schema ke Supabase
```bash
npx prisma db push
```

Ini akan membuat semua tabel yang didefinisikan di `prisma/schema.prisma` ke database Supabase Anda.

### B. Seed Database (Opsional)
Untuk mengisi data awal (produk, user admin, dll):
```bash
npm run db:seed
```

### C. Generate Prisma Client
```bash
npx prisma generate
```

## 4. Setup Supabase Storage untuk Payment Proofs

### A. Buat Storage Bucket
1. Di Supabase Dashboard, go to **Storage**
2. Klik **Create a new bucket**
3. Nama bucket: `payment-proofs`
4. **Public bucket**: ✅ Centang (agar URL gambar bisa diakses publik)
5. Klik **Create bucket**

### B. Setup Storage Policy (RLS)
Secara default bucket public sudah bisa diakses. Tapi untuk security lebih baik, buat policy:

1. Klik bucket `payment-proofs`
2. Go to tab **Policies**
3. Klik **New Policy** → **Custom**

**Policy untuk Upload (INSERT):**
```sql
CREATE POLICY "Allow service role to upload"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'payment-proofs');
```

**Policy untuk Read (SELECT):**
```sql
CREATE POLICY "Allow public to read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');
```

**Policy untuk Delete:**
```sql
CREATE POLICY "Allow service role to delete"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'payment-proofs');
```

> **Note:** Aplikasi menggunakan `service_role` key untuk upload/delete, jadi aman.

## 5. Verifikasi Koneksi

Test koneksi database:

```bash
npm run dev
```

Buka `http://localhost:3000` - jika tidak ada error, berarti koneksi sukses!

## 6. Deploy ke Vercel

### A. Push Code ke GitHub
```bash
git add .
git commit -m "Setup Supabase integration"
git push origin main
```

### B. Import Project ke Vercel
1. Login ke [Vercel Dashboard](https://vercel.com)
2. Klik **Add New** → **Project**
3. Import repository GitHub Anda
4. Di **Environment Variables**, tambahkan semua variabel dari file `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
   - `DATABASE_URL` (gunakan connection pooling URL)
   - `JWT_SECRET`
   - `STATIC_QRIS_PAYLOAD` (jika sudah ada)
   - `NEXT_PUBLIC_SITE_URL` (isi dengan URL Vercel nanti)
   - `CRON_SECRET` (generate seperti JWT_SECRET)

5. Klik **Deploy**

### C. Update NEXT_PUBLIC_SITE_URL
Setelah deploy selesai:
1. Copy URL deployment (misal: `https://tahu-sumedang.vercel.app`)
2. Di Vercel, go to **Settings** → **Environment Variables**
3. Edit `NEXT_PUBLIC_SITE_URL` dengan URL yang baru
4. Klik **Save**
5. Redeploy project

## 7. Setup Database di Production (Vercel)

Setelah deploy pertama kali, database masih kosong. Ada 2 cara:

### Cara 1: Automatic dengan Build Script (Recommended)
Prisma akan otomatis generate client saat build di Vercel karena ada script `postinstall` di `package.json`.

Tapi untuk push schema, tambahkan di build command Vercel:
- Build Command: `prisma db push --accept-data-loss && next build`

### Cara 2: Manual via Local
```bash
# Ganti DATABASE_URL ke connection string production (direct connection)
npx prisma db push
npm run db:seed
```

## 8. Testing Upload Payment Proof

Setelah selesai setup:

1. Buat order di website
2. Pilih payment method transfer bank
3. Upload bukti transfer
4. Cek di Supabase Dashboard → Storage → payment-proofs

File seharusnya muncul di folder `payments/`.

## Troubleshooting

### Error: "Can't reach database server"
- Pastikan DATABASE_URL sudah benar
- Pastikan menggunakan connection pooling URL (port 6543) untuk Vercel
- Cek di Supabase Dashboard → Settings → Database, pastikan database aktif

### Error: "Invalid API key"
- Pastikan SUPABASE_ANON_KEY dan SERVICE_ROLE_KEY sudah benar
- Jangan terbalik antara anon key dengan service role key

### Error: "Bucket not found"
- Pastikan bucket `payment-proofs` sudah dibuat di Supabase Storage
- Pastikan bucket di-set sebagai public

### Error Prisma di Vercel
- Pastikan `postinstall` script ada di package.json
- Pastikan DATABASE_URL menggunakan `?pgbouncer=true&connection_limit=1`

### Storage upload error
- Cek apakah storage policies sudah dibuat
- Pastikan menggunakan `SUPABASE_SERVICE_ROLE_KEY` untuk upload
- Cek logs di Supabase Dashboard → Logs

## File-file Penting

- `lib/supabase.ts` - Konfigurasi Supabase client
- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables (jangan di-commit!)
- `.env.example` - Template environment variables

## Security Checklist

- ✅ File `.env` ada di `.gitignore`
- ✅ SERVICE_ROLE_KEY tidak pernah diexpose ke client
- ✅ DATABASE_URL menggunakan connection pooling untuk production
- ✅ JWT_SECRET minimal 32 karakter random
- ✅ Storage policies sudah diatur dengan benar
- ✅ CRON_SECRET diisi untuk protect API cron

## Next Steps

Setelah setup selesai:
1. Test semua fitur e-commerce (order, payment, upload proof)
2. Setup monitoring di Supabase & Vercel
3. Configure custom domain di Vercel (opsional)
4. Setup email notifications (opsional)
5. Enable Supabase Analytics untuk monitoring

---

**Happy deploying! 🚀**

Jika ada masalah, cek:
- Supabase Dashboard → Logs
- Vercel Dashboard → Deployments → Function Logs
- Browser Console untuk error client-side
