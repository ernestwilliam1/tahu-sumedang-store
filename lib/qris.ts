import QRCode from 'qrcode'

export const FALLBACK_STATIC_QRIS =
  '00020101021126610014COM.GO-JEK.WWW01189360091436577114120210G6577114120303UMI51440014ID.CO.QRIS.WWW0215ID10266157500010303UMI5204899953033605802ID5925ERNEST WILLIAM IMANUEL HU6013JAKARTA TIMUR61051384062070703A01630439D2'

/**
 * Calculates CRC16-CCITT (0xFFFF) according to the EMVCo QR Code standard.
 */
export function crc16(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff
      } else {
        crc = (crc << 1) & 0xffff
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function buildTLV(tag: string, val: string): string {
  const len = val.length.toString().padStart(2, '0')
  return `${tag}${len}${val}`
}

/**
 * Generates an EMVCo-compliant Dynamic QRIS payload by:
 * 1. Setting Tag 01 (Point of Initiation Method) from 11 (Static) to 12 (Dynamic).
 * 2. Injected Tag 54 (Transaction Amount) with exact nominal.
 * 3. Injected Tag 62 (Additional Data Field Template) with orderId reference.
 * 4. Recalculating Tag 63 (CRC16-CCITT).
 */
export function generateDynamicQRIS(amount: number, orderId: string): string {
  const basePayload = process.env.STATIC_QRIS_PAYLOAD || FALLBACK_STATIC_QRIS

  // Parse TLV sequence (ignoring existing Tag 63)
  const tlvs: { tag: string; val: string }[] = []
  let i = 0
  while (i < basePayload.length) {
    const tag = basePayload.slice(i, i + 2)
    const len = parseInt(basePayload.slice(i + 2, i + 4), 10)
    const val = basePayload.slice(i + 4, i + 4 + len)
    if (tag !== '63') {
      tlvs.push({ tag, val })
    }
    i += 4 + len
  }

  // Transform into dynamic QRIS
  const result: { tag: string; val: string }[] = []
  let tag54Added = false

  for (const item of tlvs) {
    if (item.tag === '01') {
      // Switch initiation method to 12 (Dynamic)
      result.push({ tag: '01', val: '12' })
    } else if (item.tag === '54') {
      // Overwrite if Tag 54 already existed
      result.push({ tag: '54', val: Math.round(amount).toString() })
      tag54Added = true
    } else if (item.tag === '58' && !tag54Added) {
      // Standard order: Tag 54 immediately precedes Tag 58 (Country Code)
      result.push({ tag: '54', val: Math.round(amount).toString() })
      tag54Added = true
      result.push(item)
    } else if (item.tag === '62') {
      // Sub-tag 01 inside Tag 62 is Reference Label / Bill Number
      const sub01 = buildTLV('01', orderId)
      result.push({ tag: '62', val: sub01 })
    } else {
      result.push(item)
    }
  }

  // If Tag 62 wasn't present in base, append before checksum
  if (!result.some((t) => t.tag === '62')) {
    result.push({ tag: '62', val: buildTLV('01', orderId) })
  }

  let body = result.map((t) => buildTLV(t.tag, t.val)).join('')
  body += '6304'
  const checksum = crc16(body)
  return `${body}${checksum}`
}

/**
 * Generates an SVG string representation of the QR code.
 */
export async function generateQRCodeSVG(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    margin: 1,
    color: {
      dark: '#1C1917',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  })
}

/**
 * Generates a base64 Data URL for easy client rendering.
 */
export async function generateQRCodeDataURL(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 256,
    color: {
      dark: '#1C1917',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  })
}
