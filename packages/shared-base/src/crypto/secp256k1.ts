import { encodeArrayBuffer, decodeArrayBuffer, concatArrayBuffer } from '@dimensiondev/kit'
import type { EC_JsonWebKey, EC_Public_JsonWebKey } from './JWKType'
import { fromBase64URL, toBase64URL } from '../convert'
import { ECKeyIdentifier } from '../Identifier/type'
import type { EC_CryptoKey } from '.'

// This module is only used in background.
// Loading tiny-secp256k1 will instantiate a WebAssembly module which is not allowed in the content script for unknown reason and fail the whole module graph.

// TODO: switch to holoflows-kit
let secp256k1!: typeof import('tiny-secp256k1')
const isContentScript = (() => {
    try {
        if (location.protocol.startsWith('http')) return true
    } catch {}
    return false
})()
if (!isContentScript) {
    if (process.env.architecture === 'app') {
        // Note: mobile (Android and iOS does not return a correct MINE type, therefore we can not use streaming to initialize the WASM module).
        WebAssembly.instantiateStreaming = undefined
        WebAssembly.compileStreaming = undefined
    }
    import('tiny-secp256k1').then((mod) => (secp256k1 = mod))
}

/**
 * Compress x & y into a single x
 */
export function compressSecp256k1Point(x: string, y: string): Uint8Array {
    const xb = fromBase64URL(x)
    const yb = fromBase64URL(y)
    const point = new Uint8Array(concatArrayBuffer(new Uint8Array([0x04]), xb, yb))
    if (secp256k1.isPoint(point)) {
        return secp256k1.pointCompress(point, true)
    } else {
        throw new TypeError('Not a point on secp256k1!')
    }
}
/**
 * Decompress x into x & y
 */
export function decompressSecp256k1Point(point: Uint8Array): { x: string; y: string } {
    if (!secp256k1.isPoint(point)) throw new TypeError('Not a point on secp256k1!')
    const uncompressed = secp256k1.isPointCompressed(point) ? secp256k1.pointCompress(point, false) : point
    const len = (uncompressed.length - 1) / 2
    const x = uncompressed.slice(1, len + 1)
    const y = uncompressed.slice(len + 1)
    return { x: toBase64URL(x), y: toBase64URL(y) }
}

export function compressSecp256k1Key(key: EC_JsonWebKey): string {
    const arr = compressSecp256k1Point(key.x!, key.y!)
    return encodeArrayBuffer(arr)
}
export function decompressSecp256k1Key(compressedPublic: string): EC_Public_JsonWebKey {
    const arr = decodeArrayBuffer(compressedPublic)
    const key = decompressSecp256k1Point(new Uint8Array(arr))
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

export function isSecp256k1Point(x: Uint8Array) {
    return secp256k1.isPoint(x)
}

export function isSecp256k1PrivateKey(d: Uint8Array) {
    return secp256k1.isPrivate(d)
}

export function ECKeyIdentifierFromJsonWebKey(key: EC_JsonWebKey) {
    const x = compressSecp256k1Key(key)
    return new ECKeyIdentifier('secp256k1', x)
}

export async function ECKeyIdentifierFromCryptoKey(key: EC_CryptoKey) {
    const k = (await crypto.subtle.exportKey('jwk', key)) as EC_JsonWebKey
    return ECKeyIdentifierFromJsonWebKey(k)
}
