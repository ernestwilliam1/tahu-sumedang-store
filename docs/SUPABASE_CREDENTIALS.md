# Cara Mendapatkan Credentials Supabase

Panduan step-by-step untuk mendapatkan semua credentials yang diperlukan dari Supabase.

## 1. Buat Project Supabase (Jika Belum)

1. Buka https://supabase.com/dashboard
2. Login dengan GitHub/Google/Email
3. Klik **New Project**
4. Isi form:
   - **Name**: `tahu-sumedang-store` (atau nama lain)
   - **Database Password**: Buat password kuat (SIMPAN password ini!)
   - **Region**: Pilih terdekat (contoh: Southeast Asia - Singapore)
   - **Pricing Plan**: Free (cukup untuk development & small production)
5. Klik **Create new project**
6. Tunggu ~2 menit sampai project selesai setup

## 2. Dapatkan Project URL & API Keys

### Lokasi: Settings → API

1. Di Supabase Dashboard, buka project Anda
2. Klik **Settings** (icon ⚙️ di sidebar kiri bawah)
3. Klik **API** di menu settings

Anda akan melihat:

### **Project URL**
```
https://xxxxxxxxxxxxx.supabase.co
```
**Copy** dan paste ke:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_URL`

Kedua variabel ini **bernilai sama**.

### **Project API keys**

#### **anon public** (key pertama)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI...
```
**Copy** dan paste ke:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Key ini **aman** digunakan di client/browser karena Supabase punya Row Level Security (RLS).

#### **service_role secret** (key kedua, dengan icon 🔒)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI...
```
**Copy** dan paste ke:
- `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **PENTING**: Key ini adalah **admin key** dan:
- **JANGAN** commit ke Git
- **JANGAN** expose ke browser/client
- Hanya gunakan di server-side (API routes, server components)
- Memiliki akses penuh ke database (bypass RLS)

## 3. Dapatkan Database Connection String

### Lokasi: Settings → Database

1. Di Supabase Dashboard, go to **Settings** → **Database**
2. Scroll ke bagian **Connection string**
3. Anda akan lihat beberapa mode:

### **Connection pooling** (Untuk Production/Vercel)
1. Pilih tab **Connection pooling**
2. Mode: **Transaction**
3. Copy connection string:
```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

4. **Replace `[YOUR-PASSWORD]`** dengan database password yang Anda buat tadi
5. **Tambahkan** parameter di akhir:
```
postgresql://postgres.xxxxxxxxxxxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Copy** dan paste ke:
- `DATABASE_URL` (untuk production di Vercel)

**Kenapa connection pooling?**
- Vercel Serverless Functions buka connection baru setiap request
- PgBouncer membatasi jumlah connection ke database
- Mencegah "too many connections" error
- **Wajib** untuk deployment di Vercel/serverless

### **Direct connection** (Untuk Development Lokal)
1. Pilih tab **Direct connection**
2. Copy connection string:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

3. **Replace `[YOUR-PASSWORD]`** dengan database password Anda

**Copy** dan paste ke:
- `DATABASE_URL` (untuk development lokal)

**Kapan pakai direct connection?**
- Running `prisma db push` dari komputer lokal
- Running `prisma db seed` dari komputer lokal
- Running `prisma studio` untuk GUI database

## 4. Ringkasan Environment Variables

Setelah mengikuti langkah di atas, Anda akan punya:

```env
# Dari Settings → API
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Dari Settings → Database
# Untuk production (connection pooling):
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Untuk lokal (direct connection):
# DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

## 5. Storage Bucket Name

Ini **bukan** dari Supabase, tapi nama bucket yang akan Anda buat nanti:

```env
SUPABASE_STORAGE_BUCKET="payment-proofs"
```

Value ini bisa Anda tentukan sendiri, tapi **harus sama** dengan nama bucket yang dibuat di Supabase Storage.

## 6. Verifikasi Credentials

### Test Project URL & Anon Key
Buka browser dan paste URL ini (ganti dengan project Anda):
```
https://xxxxxxxxxxxxx.supabase.co/rest/v1/
```

Jika muncul error/response dari Supabase API = ✅ Project URL benar.

### Test Database Connection
Run command ini di terminal:
```bash
npx prisma db push
```

Jika berhasil dan tidak ada error = ✅ DATABASE_URL benar.

### Test di Aplikasi
1. Copy semua credentials ke file `.env`
2. Run `npm run dev`
3. Buka `http://localhost:3000`
4. Jika tidak ada error di console = ✅ Semua credentials benar

## 7. Security Checklist

Sebelum deploy, pastikan:

- [ ] File `.env` **tidak** ter-commit ke Git
- [ ] `.env` ada di `.gitignore`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` **tidak** digunakan di client-side code
- [ ] Database password cukup kuat (min 12 karakter, kombinasi huruf/angka/simbol)
- [ ] Semua secrets disimpan aman (password manager recommended)

## 8. Tips & Best Practices

### Password Database
- Gunakan password generator untuk buat password kuat
- Jangan gunakan password yang sama dengan akun lain
- Simpan di password manager (1Password, Bitwarden, dll)

### Environment Variables
- Development: Pakai **direct connection**
- Production: Pakai **connection pooling**
- Jangan copy-paste dengan spasi di awal/akhir
- Double-check typo di nama variabel

### Supabase Project
- Free plan: 500MB database, 1GB bandwidth/bulan
- Upgrade ke Pro jika butuh lebih
- Monitor usage di Dashboard → Settings → Usage
- Setup backups di Settings → Database → Backups

## 9. Troubleshooting

### "Could not fetch project settings"
- Pastikan Anda sudah login ke Supabase
- Refresh page
- Pastikan project sudah selesai setup

### "Invalid JWT"
- Pastikan copy **full** key (biasanya sangat panjang)
- Jangan ada spasi/newline di tengah key
- Re-copy dari Supabase dashboard

### "Password authentication failed"
- Pastikan password di connection string benar
- Jika lupa password, reset di Settings → Database → Database password

### "Too many connections"
- Pastikan pakai **connection pooling** URL di production
- Tambahkan `?pgbouncer=true&connection_limit=1`
- Jangan gunakan direct connection di Vercel

## 10. Reset/Regenerate Keys

### Jika Service Role Key Bocor
1. Go to Settings → API
2. Scroll ke bawah
3. Klik **Reset service_role secret**
4. Update di `.env` dan Vercel environment variables
5. Redeploy aplikasi

### Jika Database Password Lupa
1. Go to Settings → Database
2. Bagian **Database password**
3. Klik **Reset database password**
4. Input password baru
5. Update di connection string

---

## Quick Reference

| Credential | Lokasi | Untuk | Public? |
|------------|--------|-------|---------|
| Project URL | Settings → API | Client & Server | ✅ Yes |
| Anon Key | Settings → API | Client-side | ✅ Yes |
| Service Role Key | Settings → API | Server-side only | ❌ No |
| Connection Pooling | Settings → Database | Production | ❌ No |
| Direct Connection | Settings → Database | Local dev | ❌ No |

---

**Semua credentials sudah lengkap?** ✅ Lanjut ke [QUICK_START.md](../QUICK_START.md)
