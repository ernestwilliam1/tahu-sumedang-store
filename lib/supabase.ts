import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Client untuk frontend/browser - menggunakan anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

// Client untuk backend/server-side - menggunakan service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper untuk upload payment proof
export async function uploadPaymentProof(
  file: File,
  orderId: number
): Promise<{ url: string; path: string } | null> {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'payment-proofs'
  const fileExt = file.name.split('.').pop()
  const fileName = `${orderId}-${Date.now()}.${fileExt}`
  const filePath = `payments/${fileName}`

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading file:', error)
    return null
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return {
    url: publicUrl,
    path: filePath,
  }
}

// Helper untuk delete payment proof
export async function deletePaymentProof(filePath: string): Promise<boolean> {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'payment-proofs'

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([filePath])

  if (error) {
    console.error('Error deleting file:', error)
    return false
  }

  return true
}
