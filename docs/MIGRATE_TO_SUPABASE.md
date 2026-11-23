# Migrasi dari SQLite ke Supabase PostgreSQL

Panduan untuk migrasi data dari SQLite lokal ke Supabase PostgreSQL.

## Kapan Panduan Ini Dibutuhkan?

Jika Anda:
- Sudah develop dengan SQLite (`prisma/dev.db`)
- Sudah punya data di SQLite yang ingin dipindahkan
- Mau switch ke Supabase untuk production

## Prerequisite

- ✅ Supabase project sudah dibuat
- ✅ Environment variables sudah disetup
- ✅ File `.env` sudah ada

## Option 1: Fresh Start (Recommended untuk Development)

Jika data di SQLite hanya dummy/testing data:

### 1. Backup data lama (opsional)
```bash
cp prisma/dev.db prisma/dev.db.backup
```

### 2. Update schema.prisma
Schema sudah benar menggunakan PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Push schema ke Supabase
```bash
npx prisma db push
```

### 4. Seed data baru
```bash
npm run db:seed
```

Selesai! Data dummy baru sudah ada di Supabase.

## Option 2: Migrasi Data (Untuk Production Data)

Jika Anda punya data penting di SQLite:

### 1. Export data dari SQLite

Install tools:
```bash
npm install -D @prisma/migrate
```

Generate SQL dump:
```bash
# Linux/Mac
sqlite3 prisma/dev.db .dump > backup.sql

# Windows (PowerShell)
# Download SQLite CLI dari https://www.sqlite.org/download.html
# Lalu:
.\sqlite3.exe prisma\dev.db .dump > backup.sql
```

### 2. Convert SQLite SQL ke PostgreSQL format

SQLite dan PostgreSQL punya syntax yang beda. Perlu convert manual atau pakai tool.

**Manual conversion:**
1. Buka `backup.sql`
2. Replace:
   - `AUTOINCREMENT` → `SERIAL` atau hapus (Prisma handle ini)
   - `INTEGER PRIMARY KEY` → `SERIAL PRIMARY KEY`
   - SQLite quotes (`"`) → PostgreSQL quotes (`"` tetap atau ganti ke `` ` ``)
   - `PRAGMA` statements → Hapus semua
   - `BEGIN TRANSACTION` / `COMMIT` → Bisa dipertahankan

**Atau pakai tool online:**
- https://www.rebasedata.com/convert-sqlite-to-postgresql-online
- Upload `dev.db`, download PostgreSQL dump

### 3. Import ke Supabase

**Via Prisma Studio (Simple):**

1. Push schema dulu:
```bash
npx prisma db push
```

2. Buka Prisma Studio:
```bash
npx prisma studio
```

3. Copy-paste data manual tabel per tabel dari SQLite ke PostgreSQL

**Via SQL Script (Advanced):**

1. Push schema dulu:
```bash
npx prisma db push
```

2. Connect ke Supabase via psql:
```bash
# Install PostgreSQL client dulu (psql)
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql

# Get direct connection dari Supabase Dashboard
psql "postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"
```

3. Import data:
```sql
-- Di psql console
\i backup.sql
```

4. Fix sequences (jika ada error):
```sql
-- Sesuaikan sequence untuk auto-increment
SELECT setval('User_id_seq', (SELECT MAX(id) FROM "User"));
SELECT setval('Product_id_seq', (SELECT MAX(id) FROM "Product"));
-- Lakukan untuk semua tabel dengan auto-increment
```

### 4. Verify data

```bash
# Buka Prisma Studio
npx prisma studio

# Atau connect langsung
psql "postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"
```

Check:
```sql
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Product";
SELECT COUNT(*) FROM "Order";
-- Pastikan count sama dengan SQLite
```

## Option 3: Pakai Prisma Migrate (Most Proper Way)

Ini cara paling proper tapi butuh setup migration history.

### 1. Init migrations
```bash
npx prisma migrate dev --name init
```

### 2. Update DATABASE_URL ke Supabase

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"
```

### 3. Deploy migrations
```bash
npx prisma migrate deploy
```

### 4. Transfer data

Pakai Prisma Client untuk transfer:

```typescript
// scripts/migrate-data.ts
import { PrismaClient as SQLiteClient } from '@prisma/client'
import { PrismaClient as PostgresClient } from '@prisma/client'

const sqlite = new SQLiteClient({
  datasources: { db: { url: 'file:./prisma/dev.db' } }
})

const postgres = new PostgresClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})

async function migrate() {
  // Migrate users
  const users = await sqlite.user.findMany()
  for (const user of users) {
    await postgres.user.create({ data: user })
  }
  
  // Migrate products
  const products = await sqlite.product.findMany()
  for (const product of products) {
    await postgres.product.create({ data: product })
  }
  
  // Dan seterusnya untuk tabel lain...
  
  console.log('Migration complete!')
}

migrate()
  .catch(console.error)
  .finally(() => {
    sqlite.$disconnect()
    postgres.$disconnect()
  })
```

Run:
```bash
npx tsx scripts/migrate-data.ts
```

## Troubleshooting

### Error: "Relation already exists"
Database tidak kosong. Drop semua tabel dulu atau buat database baru.

**Drop all tables (HATI-HATI!):**
```sql
-- Di Supabase SQL Editor
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Lalu push schema lagi:
```bash
npx prisma db push
```

### Error: "Foreign key constraint"
Import data harus urut (tabel parent dulu, child kemudian):
1. User
2. Product, RawMaterial, Employee
3. Order
4. OrderItem
5. Dan seterusnya...

### Error: "Duplicate key"
Ada ID yang bentrok. Reset sequences:
```sql
SELECT setval('User_id_seq', (SELECT MAX(id) FROM "User") + 1);
SELECT setval('Product_id_seq', (SELECT MAX(id) FROM "Product") + 1);
-- Untuk semua tabel
```

### Data tidak lengkap setelah migrasi
Check foreign key constraints. Jika ada data orphan (child tanpa parent), tidak akan ter-import.

## Best Practices

1. **Selalu backup** sebelum migrasi
2. **Test di staging/dev environment** dulu
3. **Verify data counts** setelah migrasi
4. **Check foreign key relationships** masih intact
5. **Test aplikasi** setelah migrasi

## Rekomendasi

Untuk project baru atau development:
- ✅ **Pakai Option 1** (fresh start dengan seed)

Untuk production dengan data user real:
- ✅ **Pakai Option 2** (export/import) atau **Option 3** (Prisma script)

## Post-Migration

Setelah migrasi selesai:

1. Update `.env` dengan Supabase connection string
2. Test aplikasi lokal
3. Deploy ke Vercel dengan env vars Supabase
4. Monitor logs untuk error

---

**Note:** Jika project masih baru dan belum production, **lebih baik pakai fresh start**. Seed data baru lebih cepat dan aman.
