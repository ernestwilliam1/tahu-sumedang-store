# Deploy ke Vercel

## 1. Database PostgreSQL

Vercel tidak punya filesystem permanen, jadi SQLite tidak bisa dipakai. Pilih salah satu:

- **Supabase** (gratis) — Dashboard → Settings → Database → Connection string → *Connection pooling* (port `6543`).
- **Neon** — Dashboard → Connection Details → *Pooled connection*.

URL contoh:

```
postgresql://postgres.xxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

Setelah URL didapat, dorong skema:

```bash
npx prisma db push
```

Seed data demo (opsional, sekali saja):

```bash
npm run db:seed   # atau: npx prisma db seed
```

## 2. Storage bukti transfer

Bukti bayar diunggah customer dan harus tahan redeploy.

**Supabase Storage:**

1. Storage → New bucket → nama `payment-proofs` → centang **Public bucket**.
2. Settings → API → salin `Project URL` dan `service_role` key.
3. Isi env `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`.

Tanpa env tersebut, unggahan ditulis ke `public/images/payments/` (hanya untuk dev lokal, hilang di produksi).

## 3. Environment variables di Vercel

Project → Settings → Environment Variables (Production + Preview):

| Nama | Nilai |
|---|---|
| `DATABASE_URL` | connection string Postgres di atas |
| `JWT_SECRET` | hasil `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `STATIC_QRIS_PAYLOAD` | payload QRIS statis milik merchant |
| `NEXT_PUBLIC_SITE_URL` | `https://<domain-anda>` tanpa trailing slash |
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key Supabase |
| `SUPABASE_STORAGE_BUCKET` | `payment-proofs` |
| `CRON_SECRET` | string acak; Vercel Cron mengirimnya sebagai Bearer token |

`.env` lokal sudah di-ignore git. Referensi variabel ada di `.env.example`.

## 4. Import repo ke Vercel

1. Push repo ke GitHub.
2. Vercel → Add New → Project → pilih repo.
3. Framework terdeteksi otomatis (Next.js). Biarkan Build Command default — `package.json` sudah menjalankan `prisma generate` lewat `postinstall` dan `build`.
4. Deploy.

## 5. Setelah deploy

- Cron `/api/cron/expire` sudah terdaftar di `vercel.json` (tiap jam). Tidak perlu diatur manual.
- Cek manual: `curl -H "Authorization: Bearer $CRON_SECRET" https://<domain>/api/cron/expire`.
- Cek `/sitemap.xml` dan `/robots.txt` memakai domain produksi.
- Ganti `NEXT_PUBLIC_SITE_URL` bila domain berubah, lalu redeploy.

## Catatan

- Rate limit login disimpan di memori instance. Reset saat lambda dingin — cukup untuk mencegah brute force ringan. Untuk batas ketat lintas region, pakai Upstash Redis.
- Jangan pernah commit `.env`. `JWT_SECRET` produksi berbeda dari nilai dev.
