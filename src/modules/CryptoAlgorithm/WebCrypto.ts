import type { CryptoAlgorithmProviderMethods } from './interfaces/interface'
import {
    JsonWebKeyToCryptoKey,
    getKeyParameter,
    CryptoKeyToJsonWebKey,
} from '../../utils/type-transform/CryptoKey-JsonWebKey'
import type { AESName } from './interfaces/interface.aes'
import type { AESJsonWebKey } from './interfaces/utils'

export type WebCryptoSupportedMethods = Pick<
    CryptoAlgorithmProviderMethods,
    | 'decrypt_aes_gcm'
    | 'derive_aes_from_pbkdf2'
    | 'digest_sha'
    | 'encrypt_aes_gcm'
    | 'generate_aes_gcm'
    | 'import_pbkdf2'
    | 'aes_to_raw'
    | 'raw_to_aes'
>
export type WebCryptoNotSupportedMethods = Omit<CryptoAlgorithmProviderMethods, keyof WebCryptoSupportedMethods>

/**
 * AES-GCM & pbkdf2 related algorithms are WebCrypto supported
 * so it is safe to run it on the main thread (browser will make it async)
 */
export const WebCryptoMethods: WebCryptoSupportedMethods = {
    async encrypt_aes_gcm(jwk, iv, message) {
        const key = await JsonWebKeyToCryptoKey(jwk, ...getKeyParameter('aes'))
        return crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, message)
    },
    async decrypt_aes_gcm(jwk, iv, message) {
        const key = await JsonWebKeyToCryptoKey(jwk, ...getKeyParameter('aes'))
        return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, message)
    },
    async generate_aes_gcm(length = 256) {
        const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length }, true, ['encrypt', 'decrypt'])
        return CryptoKeyToJsonWebKey(key)
    },
    async derive_aes_from_pbkdf2(pbkdf, salt, hash, aes_algr, aes_length, iterations) {
        const key = await JsonWebKeyToCryptoKey(pbkdf, ...getKeyParameter('pbkdf2'))
        const aes = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, iterations, hash },
            key,
            { name: aes_algr, length: aes_length },
            true,
            ['encrypt', 'decrypt'],
        )
        return CryptoKeyToJsonWebKey(aes)
    },
    digest_sha(alg, data) {
        return crypto.subtle.digest(alg, data)
    },
    async import_pbkdf2(seed) {
        const key = await crypto.subtle.importKey('raw', seed, 'PBKDF2', false, ['deriveBits', 'deriveKey'])
        return CryptoKeyToJsonWebKey(key)
    },
    async aes_to_raw(aes, name: AESName = 'AES-GCM', length: 256 = 256) {
        const cryptoKey = await crypto.subtle.importKey('jwk', aes, { name, length } as AesKeyAlgorithm, true, [
            ...getKeyParameter('aes')[0],
        ])
        return crypto.subtle.exportKey('raw', cryptoKey)
    },
    async raw_to_aes(raw) {
        const cryptoKey = await crypto.subtle.importKey('raw', raw, { name, length } as AesKeyAlgorithm, true, [
            ...getKeyParameter('aes')[0],
        ])
        return (((await crypto.subtle.exportKey('jwk', cryptoKey)) as JsonWebKey) as unknown) as AESJsonWebKey
    },
}
