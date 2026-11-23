# Quick Start - Tahu Sumedang Store

Panduan cepat setup dan deploy project ini.

## Prerequisites

- Node.js 18+ 
- npm atau yarn
- Akun Supabase (gratis)
- Akun Vercel (gratis)
- Akun GitHub

## Setup Lokal (5 Menit)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi data berikut di file `.env`:

```env
# 1. Database - dari Supabase Dashboard → Settings → Database
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# 2. JWT Secret - generate dengan:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your_random_32_char_string"

# 3. Supabase - dari Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_STORAGE_BUCKET="payment-proofs"

# 4. Site URL - ganti setelah deploy
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# 5. QRIS (opsional untuk testing)
STATIC_QRIS_PAYLOAD=""

# 6. Cron Secret (generate seperti JWT_SECRET)
CRON_SECRET=""
```

### 3. Setup Database

```bash
# Push schema ke Supabase
npx prisma db push

# (Opsional) Isi data dummy
npm run db:seed
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Deploy ke Vercel (3 Menit)

### 1. Push ke GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new)
2. Import repository GitHub Anda
3. Tambahkan Environment Variables (copy dari file `.env` lokal):
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
   - `STATIC_QRIS_PAYLOAD`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (isi dulu dengan placeholder, update setelah deploy)

4. Klik **Deploy**

### 3. Update Site URL

Setelah deploy selesai:

1. Copy URL production (misal: `https://tahu-sumedang.vercel.app`)
2. Update environment variable `NEXT_PUBLIC_SITE_URL` di Vercel
3. Redeploy

## Setup Supabase Storage (1 Menit)

Untuk fitur upload bukti transfer:

1. Buka Supabase Dashboard → Storage
2. Klik **New bucket**
3. Nama: `payment-proofs`
4. **Public bucket**: ✅ Centang
5. **Create**

Selesai! Storage siap digunakan.

## Testing

### Test Lokal
```bash
npm run dev
```

Coba:
- Browse produk
- Tambah ke keranjang
- Checkout
- Upload bukti transfer

### Test Production

Buka URL Vercel Anda dan lakukan testing yang sama.

## Common Issues

### "Can't reach database"
- Pastikan `DATABASE_URL` benar
- Gunakan **Connection pooling** URL (port 6543)

### "Invalid API key"
- Cek lagi `SUPABASE_ANON_KEY` dan `SERVICE_ROLE_KEY`
- Pastikan tidak terbalik

### "Bucket not found"
- Pastikan bucket `payment-proofs` sudah dibuat
- Pastikan bucket di-set public

### Build error di Vercel
- Pastikan semua environment variables sudah diisi
- Cek build logs di Vercel dashboard

## File Structure

```
tahu-sumedang-store/
├── app/                    # Next.js App Router pages
├── components/            # React components
├── lib/                   # Utilities & configs
│   ├── supabase.ts       # Supabase client
│   ├── prisma.ts         # Prisma client
│   └── ...
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── public/               # Static assets
├── .env                  # Environment variables (local)
├── .env.example          # Template env variables
└── package.json
```

## Next Steps

✅ Setup selesai? Lanjut ke:

1. **Customize produk** - Edit `prisma/seed.ts` lalu jalankan `npm run db:seed`
2. **Setup QRIS** - Dapatkan QRIS payload dari bank, isi ke `STATIC_QRIS_PAYLOAD`
3. **Custom domain** - Setup di Vercel settings
4. **Email notifications** - Integrasikan email service
5. **Analytics** - Setup Google Analytics atau Vercel Analytics

## Dokumentasi Lengkap

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Setup Supabase detail
- [DEPLOY.md](./DEPLOY.md) - Panduan deployment
- [README.md](./README.md) - Dokumentasi lengkap project

## Support

Jika ada masalah:
1. Cek logs di Supabase Dashboard
2. Cek logs di Vercel Dashboard
3. Cek browser console

---

Happy coding! 🚀
