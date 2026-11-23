# 🚀 START HERE - Tahu Sumedang Store Setup

> **Selamat datang!** Ini adalah panduan pertama yang harus Anda baca untuk setup project e-commerce Tahu Sumedang dengan Supabase dan deploy ke Vercel.

---

## 📖 Apa yang Sudah Disiapkan?

Project ini sudah **100% siap** untuk dihubungkan dengan Supabase dan deploy ke Vercel. Semua file konfigurasi, dokumentasi, dan helper scripts sudah dibuat.

### Tech Stack
- ✅ Next.js 16 (App Router)
- ✅ Prisma ORM
- ✅ PostgreSQL (via Supabase)
- ✅ Supabase Storage (untuk payment proofs)
- ✅ Tailwind CSS 4
- ✅ TypeScript
- ✅ Authentication dengan JWT

---

## 🎯 Yang Perlu Anda Lakukan

### Langkah 1: Install Package (5 menit)
Ada satu package yang perlu diinstall secara manual:

```bash
# Buka Command Prompt (cmd.exe) atau Git Bash
cd C:\Users\Ernest\tahu-sumedang-store
npm install @supabase/supabase-js
```

**Kenapa manual?** PowerShell execution policy di Windows Anda memblock npm scripts.

### Langkah 2: Baca Dokumentasi (10 menit)
Baca file-file ini secara berurutan:

1. **📋 [RINGKASAN_SETUP.md](./RINGKASAN_SETUP.md)** ← Mulai dari sini!
   - Overview lengkap apa yang sudah disiapkan
   - Checklist yang perlu dilakukan
   - 2 menit baca

2. **📖 [docs/SUPABASE_CREDENTIALS.md](./docs/SUPABASE_CREDENTIALS.md)**
   - Cara mendapatkan semua credentials dari Supabase
   - Step-by-step dengan detail
   - 5 menit baca

3. **🚀 [QUICK_START.md](./QUICK_START.md)**
   - Setup lokal dalam 5 menit
   - Deploy ke Vercel dalam 3 menit
   - Panduan singkat & praktis

### Langkah 3: Setup Supabase (10 menit)
1. Buat project di https://supabase.com
2. Catat credentials (URL, keys, database URL)
3. Buat storage bucket `payment-proofs`

**Panduan detail:** [docs/SUPABASE_CREDENTIALS.md](./docs/SUPABASE_CREDENTIALS.md)

### Langkah 4: Setup Environment (5 menit)
```bash
# 1. Copy template
cp .env.example .env

# 2. Generate secrets
npm run generate:secrets

# 3. Edit .env dan isi semua nilai
# Ikuti panduan di .env.example
```

### Langkah 5: Setup Database (3 menit)
```bash
# Push schema ke Supabase
npx prisma db push

# Isi data dummy
npm run db:seed
```

### Langkah 6: Test Lokal (2 menit)
```bash
npm run dev
```
Buka http://localhost:3000 dan test semua fitur.

### Langkah 7: Deploy ke Vercel (10 menit)
Ikuti checklist lengkap di: **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)**

---

## 📚 Dokumentasi Lengkap

### 🎓 Untuk Pemula
Ikuti urutan ini:
1. ✅ **START_HERE.md** ← Anda di sini
2. ✅ [RINGKASAN_SETUP.md](./RINGKASAN_SETUP.md)
3. ✅ [docs/SUPABASE_CREDENTIALS.md](./docs/SUPABASE_CREDENTIALS.md)
4. ✅ [QUICK_START.md](./QUICK_START.md)
5. ✅ [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### 📖 Reference Guides
Gunakan saat dibutuhkan:

| Dokumen | Kapan Digunakan |
|---------|-----------------|
| **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** | Detail setup Supabase A-Z |
| **[docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** | Saat ada error/masalah |
| **[docs/DEPLOYMENT_FLOW.md](./docs/DEPLOYMENT_FLOW.md)** | Mau lihat big picture flow |
| **[docs/MIGRATE_TO_SUPABASE.md](./docs/MIGRATE_TO_SUPABASE.md)** | Punya data SQLite lama |
| **[.env.example](./.env.example)** | Setup environment variables |

### 🛠️ Helper Scripts
```bash
npm run dev              # Development server
npm run build            # Build production
npm run db:push          # Push schema ke database
npm run db:seed          # Seed data dummy
npm run generate:secrets # Generate JWT & CRON secrets
npx prisma studio        # Open database GUI
```

---

## ✅ Checklist Setup

Copy checklist ini dan centang saat selesai:

### Pre-Setup
- [ ] Sudah punya akun Supabase
- [ ] Sudah punya akun Vercel
- [ ] Sudah punya akun GitHub
- [ ] Node.js 18+ ter-install
- [ ] Git ter-install

### Setup Supabase
- [ ] Project Supabase dibuat
- [ ] Credentials dicatat:
  - [ ] Project URL
  - [ ] Anon Key
  - [ ] Service Role Key
  - [ ] Database URL (pooling)
  - [ ] Database URL (direct)
- [ ] Storage bucket `payment-proofs` dibuat

### Setup Lokal
- [ ] Package `@supabase/supabase-js` ter-install
- [ ] File `.env` dibuat dari `.env.example`
- [ ] JWT_SECRET & CRON_SECRET di-generate
- [ ] Semua env vars di `.env` sudah diisi
- [ ] `npx prisma db push` berhasil
- [ ] `npm run db:seed` berhasil
- [ ] `npm run dev` berjalan tanpa error
- [ ] Bisa login dengan akun seed
- [ ] Bisa buat order
- [ ] Bisa upload payment proof

### Setup Git
- [ ] Repository GitHub dibuat
- [ ] File `.env` **tidak** ter-commit (cek `.gitignore`)
- [ ] Code di-push ke GitHub

### Deploy Vercel
- [ ] Project di-import ke Vercel
- [ ] Semua env vars di-set di Vercel:
  - [ ] DATABASE_URL (connection pooling!)
  - [ ] JWT_SECRET
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] SUPABASE_STORAGE_BUCKET
  - [ ] NEXT_PUBLIC_SITE_URL
  - [ ] STATIC_QRIS_PAYLOAD (optional)
  - [ ] CRON_SECRET
- [ ] Deploy berhasil
- [ ] Site URL updated & redeploy
- [ ] Website bisa diakses
- [ ] Semua fitur berfungsi di production

---

## 🎯 Estimasi Waktu

| Task | Waktu |
|------|-------|
| Baca dokumentasi | 10-15 menit |
| Setup Supabase project | 10 menit |
| Setup environment lokal | 5 menit |
| Setup database | 3 menit |
| Test lokal | 5 menit |
| Deploy ke Vercel | 10 menit |
| Verification | 5 menit |
| **TOTAL** | **~45-50 menit** |

Jika sudah familiar dengan Supabase & Vercel: **~20 menit**

---

## 🆘 Butuh Bantuan?

### Ada Error?
Lihat: **[docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)**

Semua error umum sudah didokumentasikan dengan solusinya.

### Bingung Alur Setup?
Lihat: **[docs/DEPLOYMENT_FLOW.md](./docs/DEPLOYMENT_FLOW.md)**

Diagram visual step-by-step deployment.

### Sudah Punya Data SQLite?
Lihat: **[docs/MIGRATE_TO_SUPABASE.md](./docs/MIGRATE_TO_SUPABASE.md)**

Cara migrasi dari SQLite ke PostgreSQL.

---

## 🎉 Setelah Setup Selesai

Anda akan punya:
- ✅ E-commerce website yang fully functional
- ✅ Database PostgreSQL di Supabase (500MB free)
- ✅ File storage untuk payment proofs
- ✅ Auto-deploy setiap push ke GitHub
- ✅ Production-ready deployment di Vercel
- ✅ HTTPS & CDN otomatis
- ✅ Monitoring & analytics

### Next Steps
1. **Customize produk** - Edit seed data di `prisma/seed.ts`
2. **Setup QRIS** - Dapatkan dari bank, isi `STATIC_QRIS_PAYLOAD`
3. **Custom domain** - Setup di Vercel settings (optional)
4. **Email notifications** - Integrasikan email service (optional)
5. **Social media** - Share link ke teman/customer!

---

## 📋 Quick Commands Reference

```bash
# Setup
npm install
npm install @supabase/supabase-js
cp .env.example .env
npm run generate:secrets

# Database
npx prisma db push
npm run db:seed
npx prisma studio

# Development
npm run dev
npm run build
npm run start

# Deploy
git add .
git commit -m "Setup complete"
git push origin main
# Then import to Vercel
```

---

## 🔐 Security Reminders

**JANGAN:**
- ❌ Commit file `.env` ke Git
- ❌ Share `SERVICE_ROLE_KEY` di public
- ❌ Hardcode secrets di code
- ❌ Pakai weak password untuk database

**LAKUKAN:**
- ✅ Gunakan `.env` untuk secrets
- ✅ Set environment variables di Vercel
- ✅ Generate random secrets (32+ chars)
- ✅ Enable 2FA di Supabase & Vercel

---

## 🚀 Ready to Start?

1. **Prioritas pertama:** Install `@supabase/supabase-js`
2. **Baca:** [RINGKASAN_SETUP.md](./RINGKASAN_SETUP.md)
3. **Follow:** [QUICK_START.md](./QUICK_START.md)
4. **Deploy!** 🎉

---

**Semua sudah disiapkan. Tinggal ikuti langkah-langkahnya!**

Good luck! 💪🚀

---

<div align="center">

**Made with ❤️ for Tahu Sumedang Store**

[🏠 Kembali ke README](./README.md) | [📚 Lihat Semua Dokumentasi](./docs/)

</div>
