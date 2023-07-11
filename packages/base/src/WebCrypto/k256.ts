import { encodeArrayBuffer, decodeArrayBuffer, concatArrayBuffer } from '@masknet/kit'
import type { EC_JsonWebKey, EC_Public_JsonWebKey } from './JsonWebKey.js'
import { Convert } from 'pvtsutils'

/**
 * Compress x & y into a single x
 */
export async function compressK256Point(x: string, y: string): Promise<Uint8Array> {
    const { isPoint, pointCompress } = await import('tiny-secp256k1')
    const xb = new Uint8Array(Convert.FromBase64Url(x))
    const yb = new Uint8Array(Convert.FromBase64Url(y))
    const point = new Uint8Array(concatArrayBuffer(new Uint8Array([0x04]), xb, yb))
    if (isPoint(point)) {
        return pointCompress(point, true)
    } else {
        throw new TypeError('Not a point on secp256k1.')
    }
}
/**
 * Decompress x into x & y
 */
export async function decompressK256Point(point: Uint8Array): Promise<{ x: string; y: string }> {
    const { isPoint, isPointCompressed, pointCompress } = await import('tiny-secp256k1')
    if (!isPoint(point)) throw new TypeError('Not a point on secp256k1.')
    const uncompressed = isPointCompressed(point) ? pointCompress(point, false) : point
    const len = (uncompressed.length - 1) / 2
    const x = uncompressed.slice(1, len + 1)
    const y = uncompressed.slice(len + 1)
    return { x: Convert.ToBase64Url(x), y: Convert.ToBase64Url(y) }
}

export async function compressK256KeyRaw(point: Uint8Array) {
    const { isPoint, isPointCompressed, pointCompress } = await import('tiny-secp256k1')
    if (!isPoint(point)) throw new TypeError('Not a point on secp256k1.')
    if (isPointCompressed(point)) return point
    return pointCompress(point, true)
}
export async function decompressK256Raw(point: Uint8Array) {
    const { isPoint, isPointCompressed, pointCompress } = await import('tiny-secp256k1')
    if (!isPoint(point)) throw new TypeError('Not a point on secp256k1.')
    if (!isPointCompressed(point)) return point
    return pointCompress(point, false)
}

export async function compressK256Key(key: EC_JsonWebKey): Promise<string> {
    const arr = await compressK256Point(key.x!, key.y!)
    return encodeArrayBuffer(arr)
}
export async function decompressK256Key(compressedPublic: string): Promise<EC_Public_JsonWebKey> {
    const arr = decodeArrayBuffer(compressedPublic)
    const key = await decompressK256Point(new Uint8Array(arr))
    const jwk: JsonWebKey = {
        crv: 'K-256',
        ext: true,
        x: key.x,
        y: key.y,
        key_ops: ['deriveKey', 'deriveBits'],
        kty: 'EC',
    }
    return jwk as EC_Public_JsonWebKey
}

export async function isK256Point(x: Uint8Array) {
    const { isPoint } = await import('tiny-secp256k1')
    return isPoint(x)
}

export async function isK256PrivateKey(d: Uint8Array) {
    const { isPrivate } = await import('tiny-secp256k1')
    return isPrivate(d)
}
