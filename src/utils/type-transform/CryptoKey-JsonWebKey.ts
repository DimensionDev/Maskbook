import stableStringify from 'json-stable-stringify'
const CryptoKeyCache = new Map<string, CryptoKey>()
const JsonWebKeyCache = new WeakMap<CryptoKey, JsonWebKey>()

type Usages = 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'deriveKey' | 'deriveBits' | 'unwrapKey'
type Algorithms =
    | string
    | RsaHashedImportParams
    | EcKeyImportParams
    | HmacImportParams
    | DhImportKeyParams
    | AesKeyAlgorithm

/**
 * Get a (cached) CryptoKey from JsonWebKey
 * @param algorithm - use which algorithm to import this key, defaults to ECDH K-256
 * @param key - The JsonWebKey
 * @param usage - Usage
 */
export async function JsonWebKeyToCryptoKey(
    key: JsonWebKey,
    usage: Usages[] = ['deriveKey', 'deriveBits'],
    algorithm: Algorithms = { name: 'ECDH', namedCurve: 'K-256' },
): Promise<CryptoKey> {
    const _key = stableStringify(key) + usage.sort().join(',')
    if (CryptoKeyCache.has(_key)) return CryptoKeyCache.get(_key)!
    const cryptoKey = await crypto.subtle.importKey('jwk', key, algorithm, true, usage)
    CryptoKeyCache.set(_key, cryptoKey)
    JsonWebKeyCache.set(cryptoKey, key)
    return cryptoKey
}

/**
 * Get a (cached) JsonWebKey from CryptoKey
 * @param key - The CryptoKey
 */
export async function CryptoKeyToJsonWebKey(key: CryptoKey): Promise<JsonWebKey> {
    if (JsonWebKeyCache.has(key)) return JsonWebKeyCache.get(key)!
    const jwk = await crypto.subtle.exportKey('jwk', key)
    JsonWebKeyCache.set(key, jwk)
    const hash = stableStringify(jwk) + key.usages.sort().join(',')
    CryptoKeyCache.set(hash, key)
    return jwk
}
