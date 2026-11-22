// Penyimpanan bukti transfer.
// ponytail: pakai Supabase Storage REST langsung via fetch — tidak perlu SDK.
// Ganti ke @vercel/blob kalau pindah provider; antarmuka tetap `uploadPaymentProof`.
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'payment-proofs'

function storageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

/**
 * Simpan buffer ke storage publik dan kembalikan URL yang bisa dibuka.
 * Dev lokal (env kosong) menulis ke public/images/payments/ agar tetap jalan tanpa cloud.
 */
export async function savePaymentProof(fileName: string, buffer: Buffer, contentType: string): Promise<string> {
  if (!storageConfigured()) {
    const fs = await import('fs/promises')
    const path = await import('path')
    const dir = path.join(process.cwd(), 'public', 'images', 'payments')
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, fileName), buffer)
    return `/images/payments/${fileName}`
  }

  const base = process.env.SUPABASE_URL!.replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const objectPath = `payments/${fileName}`

  const res = await fetch(`${base}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
      'Cache-Control': 'max-age=31536000',
    },
    body: new Uint8Array(buffer),
  })

  if (!res.ok) {
    throw new Error(`Storage upload gagal (${res.status}): ${await res.text()}`)
  }

  return `${base}/storage/v1/object/public/${BUCKET}/${objectPath}`
}
