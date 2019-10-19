import secp256k1 from 'tiny-secp256k1'
import { Convert, combine } from 'pvtsutils'
import { encodeArrayBuffer, decodeArrayBuffer } from './String-ArrayBuffer'
/**
 * Compress x & y into a single x
 *
 * @deprecated This method should not export. Use higher level abstraction `compressSecp256k1Key` instead.
 */
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
/**
 * Decompress x into x & y
 *
 * @deprecated This method should not export. Use higher level abstraction `decompressSecp256k1Key` instead.
 */
export function unCompressSecp256k1Point(point: ArrayBuffer): { x: string; y: string } {
    const p = Buffer.from(point)
    if (!secp256k1.isPoint(p)) throw new TypeError('Not a point on secp256k1!')
    const uncompressed: Uint8Array = secp256k1.isPointCompressed(p) ? secp256k1.pointCompress(p, false) : p
    const len = (uncompressed.length - 1) / 2
    const x = uncompressed.slice(1, len + 1)
    const y = uncompressed.slice(len + 1)
    return { x: Convert.ToBase64Url(x), y: Convert.ToBase64Url(y) }
}

export function compressSecp256k1Key(key: JsonWebKey): string {
    const arr = toCompressSecp256k1Point(key.x!, key.y!)
    return encodeArrayBuffer(arr)
}
export function decompressSecp256k1Key(compressed: string): JsonWebKey {
    const arr = decodeArrayBuffer(compressed)
    const key = unCompressSecp256k1Point(arr)
    return {
        crv: 'K-256',
        ext: true,
        x: key.x,
        y: key.y,
        key_ops: ['deriveKey'],
        kty: 'EC',
    }
}
