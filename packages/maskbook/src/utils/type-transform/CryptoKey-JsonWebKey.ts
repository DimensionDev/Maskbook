import stableStringify from 'json-stable-stringify'
const CryptoKeyCache = new Map<string, CryptoKey>()
const JsonWebKeyCache = new WeakMap<CryptoKey, JsonWebKey>()

type Algorithms = string | RsaHashedImportParams | EcKeyImportParams | HmacImportParams | AesKeyAlgorithm

export function getKeyParameter(
    type: 'ecdh' | 'ecdsa' | 'aes' | 'pbkdf2',
): [readonly KeyUsage[], Readonly<Algorithms>] {
    if (type === 'ecdh') return [['deriveKey', 'deriveBits'], { name: 'ECDH', namedCurve: 'K-256' }]
    if (type === 'aes') return [['encrypt', 'decrypt'], { name: 'AES-GCM', length: 256 }]
    if (type === 'ecdsa') return [['sign', 'verify'], { name: 'ecdsa', namedCurve: 'K-256' }]
    throw new TypeError('Invalid key type')
}

/**
 * Get a (cached) CryptoKey from JsonWebKey
 *
 * JsonWebKeyToCryptoKey(key, ...getKeyParameter('aes'))
 *
 * @param algorithm - use which algorithm to import this key, defaults to ECDH K-256
 * @param key - The JsonWebKey
 * @param usage - Usage
 */
export async function JsonWebKeyToCryptoKey(
    key: JsonWebKey,
    usage: readonly KeyUsage[],
    algorithm: Algorithms,
): Promise<CryptoKey> {
    key = { ...key }
    // ? In some cases the raw JWK stores the usage of "decrypt" only so our full usage will throw an error
    const usages = [...usage].sort().join(',')
    if (key.key_ops) {
        if (key.key_ops.sort().join('.') !== usages) {
            key.key_ops = [...usage]
        }
    }
    const _key = stableStringify(key) + usages
    if (CryptoKeyCache.has(_key)) return CryptoKeyCache.get(_key)!
    const cryptoKey = await crypto.subtle.importKey('jwk', key, algorithm, true, [...usage])
    CryptoKeyCache.set(_key, cryptoKey)
    JsonWebKeyCache.set(cryptoKey, key)
    return cryptoKey
}

/**
 * Get a (cached) JsonWebKey from CryptoKey
 * @param key - The CryptoKey
 */
export async function CryptoKeyToJsonWebKey<T extends JsonWebKey = JsonWebKey>(key: CryptoKey): Promise<T> {
    // Any of nominal subtype of JsonWebKey in this project is runtime equivalent to JsonWebKey
    // so it is safe to do the force cast
    if (JsonWebKeyCache.has(key)) return JsonWebKeyCache.get(key)! as T
    const jwk = await crypto.subtle.exportKey('jwk', key)
    JsonWebKeyCache.set(key, jwk)
    const hash = stableStringify(jwk) + [...key.usages].sort().join(',')
    CryptoKeyCache.set(hash, key)
    return jwk as T
}
