export function encodeText(str: string) {
    return new TextEncoder().encode(str)
}
export function decodeText(str: ArrayBuffer) {
    return new TextDecoder().decode(str)
}
export function decodeArrayBuffer(str: string): ArrayBuffer {
    const decodedString = atob(str)
    const uintArr = []
    for (const i of decodedString) uintArr.push(i.charCodeAt(0))
    return new Uint8Array(uintArr).buffer
}
export function encodeArrayBuffer(buffer: ArrayBuffer) {
    const x = [...new Uint8Array(buffer)]
    const encodedString = String.fromCharCode.apply(null, x)
    return btoa(encodedString)
}
import { Convert, combine } from 'pvtsutils'
/**
 * ! Combine 2 char in lower space of Unicode into one char in higher space of Unicode (CJK area).
 * Be careful when using it.
 */
export function encodeTextOrange(str: string) {
    const pre = [...str].map(x => x.codePointAt(0)!)
    while (pre.length % 4 !== 0) pre.push(0)
    const code8 = new Uint8Array(pre)
    const code16 = new Uint16Array(code8.buffer)
    const post = Array.from(code16.values())
    return post.map(x => String.fromCodePoint(x)).join('')
}
export function decodeTextOrange(str: string) {
    const post = [...str].map(x => x.codePointAt(0)!)
    const code16 = new Uint16Array(post)
    const code8 = new Uint8Array(code16.buffer)
    const pre = Array.from(code8.values())
    while (pre[pre.length - 1] === 0) pre.pop()
    return pre.map(x => String.fromCodePoint(x)).join('')
}

import secp256k1 from 'tiny-secp256k1'
/** Compress x & y into a single x */
export function toCompressSecp256k1Point(x: string, y: string): Uint8Array {
    const xb = Convert.FromBase64Url(x)
    const yb = Convert.FromBase64Url(y)
    const point = Buffer.from(combine(new Uint8Array([0x04]), xb, yb))
    if (secp256k1.isPoint(point)) {
        return secp256k1.pointCompress(point, true)
    } else {
        throw new TypeError('Not a point on secp256k1!')
    }
}
/** Decompress x into x & y */
export function unCompressSecp256k1Point(point: ArrayBuffer): { x: string; y: string } {
    const p = Buffer.from(point)
    if (!secp256k1.isPoint(p)) throw new TypeError('Not a point on secp256k1!')
    const uncompressed: Uint8Array = secp256k1.isPointCompressed(p) ? secp256k1.pointCompress(p, false) : p
    const len = (uncompressed.length - 1) / 2
    const x = uncompressed.slice(1, len + 1)
    const y = uncompressed.slice(len + 1)
    return { x: Convert.ToBase64Url(x), y: Convert.ToBase64Url(y) }
}
Object.assign(window, { encodeText, decodeText, decodeArrayBuffer, encodeArrayBuffer })
