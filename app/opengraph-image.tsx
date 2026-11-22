import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 64,
          background: '#FAF9F6',
          border: '12px solid #E5E2DC',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 6, background: '#D97706', borderRadius: 999 }} />
          <span style={{ fontSize: 14, letterSpacing: 4, color: '#D97706', fontWeight: 700 }}>TAHU SUMEDANG ASLI</span>
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 64,
            fontWeight: 900,
            color: '#1C1917',
            lineHeight: 1.1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>Renyah di Luar,</span>
          <span>Lembut Kopong di Dalam</span>
        </div>
        <div style={{ marginTop: 16, fontSize: 20, color: '#57534E', maxWidth: 720 }}>
          Tahu Sumedang digoreng segar setiap pesanan. Stok real-time, antar atau ambil di toko.
        </div>
        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          <div style={{ padding: '10px 22px', background: '#D97706', color: 'white', borderRadius: 999, fontWeight: 800 }}>Pesan Sekarang</div>
          <div style={{ padding: '10px 22px', background: 'white', border: '1px solid #E5E2DC', borderRadius: 999, fontWeight: 700, color: '#1C1917' }}>tahusumedang.id</div>
        </div>
      </div>
    ),
    size
  )
}
