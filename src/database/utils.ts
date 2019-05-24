import { GroupIdentifier, PersonIdentifier } from './type'
import { queryAvatarDB } from './avatar'

const avatarCache = new Map<string, string>()
/**
 * Get a (cached) blob url for a identifier.
 */
export async function getAvatarUrl(identifier: PersonIdentifier | GroupIdentifier): Promise<string | null> {
    const id = identifier.toString()
    if (avatarCache.has(id)) return avatarCache.get(id)!
    const buffer = await queryAvatarDB(identifier)
    if (!buffer) return null
    const blob = new Blob([buffer], { type: 'image/png' })
    const url = URL.createObjectURL(blob)
    avatarCache.set(id, url)
    return url
}

const cryptoKeyCache = new Map<string, CryptoKey>()
/**
 * Get a (cached) CryptoKey from JsonWebKey
 * @param algorithm - use which algorithm to import this key, defaults to ECDH K-256
 * @param key - The JsonWebKey
 * @param usage - Usage
 */
export async function JsonWebKeyToCryptoKey(
    key: JsonWebKey,
    usage: ('encrypt' | 'decrypt' | 'sign' | 'verify' | 'deriveKey' | 'deriveBits' | 'unwrapKey')[] = ['deriveKey'],
    algorithm:
        | string
        | RsaHashedImportParams
        | EcKeyImportParams
        | HmacImportParams
        | DhImportKeyParams
        | AesKeyAlgorithm = { name: 'ECDH', namedCurve: 'K-256' },
) {
    const _key = JSON.stringify(key) + usage.join(',')
    if (cryptoKeyCache.has(_key)) return cryptoKeyCache.get(_key)
    const cryptoKey = await crypto.subtle.importKey('jwk', key, algorithm, true, usage)
    cryptoKeyCache.set(_key, cryptoKey)
    return cryptoKey
}

const jsonKeyCache = new WeakMap<CryptoKey, JsonWebKey>()
/**
 * Get a (cached) JsonWebKey from CryptoKey
 * @param key - The CryptoKey
 */
export async function CryptoKeyToJsonWebKey(key: CryptoKey) {
    if (jsonKeyCache.has(key)) return jsonKeyCache.get(key)
    const jwk = await crypto.subtle.exportKey('jwk', key)
    jsonKeyCache.set(key, jwk)
    return jwk
}
