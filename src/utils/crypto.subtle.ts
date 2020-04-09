function getType(x: JsonWebKey | ArrayBuffer | Uint8Array): 'raw' | 'jwk' {
    if (x instanceof ArrayBuffer) return 'raw'
    if (x instanceof Uint8Array) return 'raw'
    return 'jwk'
}
export function generate_AES_GCM_256_Key() {
    return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
}
export function generate_ECDH_256k1_KeyPair() {
    return crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey', 'deriveBits'])
}
export function import_ECDH_256k1_Key(key: JsonWebKey | ArrayBuffer) {
    return crypto.subtle.importKey(getType(key), key, { name: 'ECDH', namedCurve: 'K-256' }, true, [
        'deriveKey',
        'deriveBits',
    ])
}
export async function import_ECDH_256k1_KeyPair(key: JsonWebKey): Promise<CryptoKeyPair> {
    key = { ...key }
    if (!key.d) throw new TypeError('import_ECDH_256k1_KeyPair requires a privkey (jwt d)')
    const privateKey = await import_ECDH_256k1_Key(key)
    delete key.d
    const publicKey = await import_ECDH_256k1_Key(key)
    return { privateKey, publicKey }
}
export function import_AES_GCM_256_Key(key: JsonWebKey | ArrayBuffer) {
    return crypto.subtle.importKey(getType(key), key, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
}

export function import_PBKDF2_Key(key: ArrayBuffer) {
    return crypto.subtle.importKey(getType(key), key, 'PBKDF2', false, ['deriveBits', 'deriveKey'])
}
export function derive_AES_GCM_256_Key_From_ECDH_256k1_Keys(pub: CryptoKey, priv: CryptoKey) {
    return crypto.subtle.deriveKey({ name: 'ECDH', public: pub }, priv, { name: 'AES-GCM', length: 256 }, true, [
        'encrypt',
        'decrypt',
    ])
}
export function derive_AES_GCM_256_Key_From_PBKDF2(
    pbkdf: CryptoKey,
    iv: ArrayBuffer,
    hash = 'SHA-256',
    iterations = 100000,
) {
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: iv, iterations, hash },
        pbkdf,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt'],
    )
}
