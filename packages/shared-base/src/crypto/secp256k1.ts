import { encodeArrayBuffer, decodeArrayBuffer, concatArrayBuffer } from '@dimensiondev/kit'
import type { EC_JsonWebKey, EC_Public_JsonWebKey } from './JWKType'
import { fromBase64URL, toBase64URL } from '../convert'
import { ECKeyIdentifier } from '../Identifier'

// This module is only used in background.
// Loading tiny-secp256k1 will instantiate a WebAssembly module which is not allowed in the content script for unknown reason and fail the whole module graph.

async function loadLib(): Promise<typeof import('tiny-secp256k1')> {
    if (process.env.architecture === 'app') {
        // Note: mobile (Android and iOS does not return a correct MINE type, therefore we can not use streaming to initialize the WASM module).
        WebAssembly.instantiateStreaming = undefined!
        WebAssembly.compileStreaming = undefined!
    }
    // You should not load this module in the content script. If you find you're stuck here, please check your code why it is loading this lib.
    const mod = await import('tiny-secp256k1')
    return mod
}

/**
 * Compress x & y into a single x
 */
export async function compressSecp256k1Point(x: string, y: string): Promise<Uint8Array> {
    const { isPoint, pointCompress } = await loadLib()
    const xb = fromBase64URL(x)
    const yb = fromBase64URL(y)
    const point = new Uint8Array(concatArrayBuffer(new Uint8Array([0x04]), xb, yb))
    if (isPoint(point)) {
        return pointCompress(point, true)
    } else {
        throw new TypeError('Not a point on secp256k1!')
    }
}
/**
 * Decompress x into x & y
 */
export async function decompressSecp256k1Point(point: Uint8Array): Promise<{ x: string; y: string }> {
    const { isPoint, isPointCompressed, pointCompress } = await loadLib()
    if (!isPoint(point)) throw new TypeError('Not a point on secp256k1!')
    const uncompressed = isPointCompressed(point) ? pointCompress(point, false) : point
    const len = (uncompressed.length - 1) / 2
    const x = uncompressed.slice(1, len + 1)
    const y = uncompressed.slice(len + 1)
    return { x: toBase64URL(x), y: toBase64URL(y) }
}

export async function compressSecp256k1KeyRaw(point: Uint8Array) {
    const { isPoint, isPointCompressed, pointCompress } = await loadLib()
    if (!isPoint(point)) throw new TypeError('Not a point on secp256k1!')
    if (isPointCompressed(point)) return point
    return pointCompress(point, true)
}
export async function decompressSecp256k1KeyRaw(point: Uint8Array) {
    const { isPoint, isPointCompressed, pointCompress } = await loadLib()
    if (!isPoint(point)) throw new TypeError('Not a point on secp256k1!')
    if (!isPointCompressed(point)) return point
    return pointCompress(point, false)
}

async function compressSecp256k1Key(key: EC_JsonWebKey): Promise<string> {
    const arr = await compressSecp256k1Point(key.x!, key.y!)
    return encodeArrayBuffer(arr)
}
export async function decompressSecp256k1Key(compressedPublic: string): Promise<EC_Public_JsonWebKey> {
    const arr = decodeArrayBuffer(compressedPublic)
    const key = await decompressSecp256k1Point(new Uint8Array(arr))
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

export async function isSecp256k1Point(x: Uint8Array) {
    const { isPoint } = await loadLib()
    return isPoint(x)
}

export async function isSecp256k1PrivateKey(d: Uint8Array) {
    const { isPrivate } = await loadLib()
    return isPrivate(d)
}

export async function ECKeyIdentifierFromJsonWebKey(key: EC_JsonWebKey) {
    const x = await compressSecp256k1Key(key)
    return new ECKeyIdentifier('secp256k1', x)
}
