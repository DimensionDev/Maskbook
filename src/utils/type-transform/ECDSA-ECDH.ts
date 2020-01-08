export async function toECDSA(key: CryptoKey) {
    const exported = await crypto.subtle.exportKey('jwk', key)
    return crypto.subtle.importKey('jwk', exported, { name: 'ecdsa', namedCurve: 'K-256' }, true, ['sign', 'verify'])
}
export async function toECDH(key: CryptoKey) {
    const exported = await crypto.subtle.exportKey('jwk', key)
    return crypto.subtle.importKey('jwk', exported, { name: 'ECDH', namedCurve: 'K-256' }, true, [
        'deriveKey',
        'deriveBits',
    ])
}
export function addUint8Array(a: ArrayBuffer, b: ArrayBuffer) {
    const x = new Uint8Array(a)
    const y = new Uint8Array(b)
    const c = new Uint8Array(x.length + y.length)
    c.set(x)
    c.set(y, x.length)
    return c
}
