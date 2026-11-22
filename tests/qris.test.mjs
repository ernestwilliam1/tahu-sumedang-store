// Jalankan: node --test tests/
// Cek integritas payload QRIS dinamis (EMVCo): CRC16 + Tag 01/54/62.
import test from 'node:test'
import assert from 'node:assert/strict'

const STATIC =
  '00020101021126610014COM.GO-JEK.WWW01189360091436577114120210G6577114120303UMI51440014ID.CO.QRIS.WWW0215ID10266157500010303UMI5204899953033605802ID5925ERNEST WILLIAM IMANUEL HU6013JAKARTA TIMUR61051384062070703A01630439D2'

// Salinan crc16 dari lib/qris.ts — file itu TypeScript, tidak bisa di-import langsung oleh node --test.
function crc16(str) {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function parseTLV(payload) {
  const out = {}
  let i = 0
  while (i < payload.length) {
    const tag = payload.slice(i, i + 2)
    const len = parseInt(payload.slice(i + 2, i + 4), 10)
    out[tag] = payload.slice(i + 4, i + 4 + len)
    i += 4 + len
  }
  return out
}

function buildDynamic(basePayload, amount, orderId) {
  const tlvs = []
  let i = 0
  while (i < basePayload.length) {
    const tag = basePayload.slice(i, i + 2)
    const len = parseInt(basePayload.slice(i + 2, i + 4), 10)
    const val = basePayload.slice(i + 4, i + 4 + len)
    if (tag !== '63') tlvs.push({ tag, val })
    i += 4 + len
  }
  const result = []
  let tag54Added = false
  const tlv = (tag, val) => `${tag}${val.length.toString().padStart(2, '0')}${val}`
  for (const item of tlvs) {
    if (item.tag === '01') result.push({ tag: '01', val: '12' })
    else if (item.tag === '54') { result.push({ tag: '54', val: String(Math.round(amount)) }); tag54Added = true }
    else if (item.tag === '58' && !tag54Added) {
      result.push({ tag: '54', val: String(Math.round(amount)) })
      tag54Added = true
      result.push(item)
    } else if (item.tag === '62') result.push({ tag: '62', val: tlv('01', orderId) })
    else result.push(item)
  }
  if (!result.some((t) => t.tag === '62')) result.push({ tag: '62', val: tlv('01', orderId) })
  const body = result.map((t) => tlv(t.tag, t.val)).join('') + '6304'
  return body + crc16(body)
}

test('CRC16 payload statis valid', () => {
  assert.equal(STATIC.slice(-4), crc16(STATIC.slice(0, -4)))
  assert.equal(crc16(STATIC.slice(0, -4)), '39D2')
})

test('QRIS dinamis: Tag 01=12, Tag 54 nominal, Tag 62 orderId, CRC valid', () => {
  const out = buildDynamic(STATIC, 25000, 'TS-1234567')
  const tlv = parseTLV(out)
  assert.equal(tlv['01'], '12')
  assert.equal(tlv['54'], '25000')
  assert.equal(parseTLV(tlv['62'])['01'], 'TS-1234567')
  assert.equal(out.slice(-4), crc16(out.slice(0, -4)))
  assert.equal(tlv['63'], out.slice(-4))
})
