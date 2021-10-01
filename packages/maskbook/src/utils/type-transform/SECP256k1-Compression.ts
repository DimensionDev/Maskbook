import secp256k1 from 'tiny-secp256k1'
import { Convert, combine } from 'pvtsutils'
import { encodeArrayBuffer, decodeArrayBuffer } from '@dimensiondev/kit'
import type {
    EC_Public_JsonWebKey,
    EC_Private_JsonWebKey,
    EC_JsonWebKey,
} from '../../modules/CryptoAlgorithm/interfaces/utils'
import { Buffer } from 'buffer'
/**
 * Compress x & y into a single x
 */
export function compressSecp256k1Point(x: string, y: string): Uint8Array {
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
 */
export function decompressSecp256k1Point(point: ArrayBuffer): { x: string; y: string } {
    const p = Buffer.from(point)
    if (!secp256k1.isPoint(p)) throw new TypeError('Not a point on secp256k1!')
    const uncompressed: Uint8Array = secp256k1.isPointCompressed(p) ? secp256k1.pointCompress(p, false) : p
    const len = (uncompressed.length - 1) / 2
    const x = uncompressed.slice(1, len + 1)
    const y = uncompressed.slice(len + 1)
    return { x: Convert.ToBase64Url(x), y: Convert.ToBase64Url(y) }
}

export function compressSecp256k1Key(key: EC_JsonWebKey, type: 'public' | 'private'): string {
    if (type === 'private' && !key.d) throw new Error('Private key does not contain secret')
    const arr = compressSecp256k1Point(key.x!, key.y!)
    return encodeArrayBuffer(arr) + (type === 'private' ? '🙈' + key.d! : '')
}
export function decompressSecp256k1Key(compressed: string, type: 'public'): EC_Public_JsonWebKey
export function decompressSecp256k1Key(compressed: string, type: 'private'): EC_Private_JsonWebKey
export function decompressSecp256k1Key(compressed: string, type: 'public' | 'private'): EC_JsonWebKey {
    const [compressedPublic, privateKey] = compressed.split('🙈')
    if (type === 'private' && privateKey.length < 1) throw new Error('Private key does not contain secret')
    const arr = decodeArrayBuffer(compressedPublic)
    const key = decompressSecp256k1Point(arr)
    const jwk: JsonWebKey = {
        crv: 'K-256',
        ext: true,
        x: key.x,
        y: key.y,
        key_ops: ['deriveKey', 'deriveBits'],
        kty: 'EC',
        d: type === 'private' ? privateKey : undefined,
    }
    return jwk as EC_JsonWebKey
}
