import type { CryptoAlgorithmProviderMethods } from './interface'
import {
    JsonWebKeyToCryptoKey,
    getKeyParameter,
    CryptoKeyToJsonWebKey,
} from '../../utils/type-transform/CryptoKey-JsonWebKey'

export type WebCryptoSupportedMethods = Pick<
    CryptoAlgorithmProviderMethods,
    | 'decrypt_aes_gcm'
    | 'derive_aes_gcm256_from_pbkdf2'
    | 'encrypt_aes_gcm'
    | 'generate_aes_gcm'
    | 'import_pbkdf2'
    | 'digest_sha256'
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
    async generate_aes_gcm() {
        const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
        return CryptoKeyToJsonWebKey(key)
    },
    async derive_aes_gcm256_from_pbkdf2(hash, iterations, pbkdf, salt) {
        const key = await JsonWebKeyToCryptoKey(pbkdf, ...getKeyParameter('pbkdf2'))
        const aes = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, iterations, hash },
            key,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt'],
        )
        return CryptoKeyToJsonWebKey(aes)
    },
    digest_sha256(data) {
        return crypto.subtle.digest('SHA-256', data)
    },
    async import_pbkdf2(seed) {
        return crypto.subtle
            .importKey('raw', seed, 'PBKDF2', false, ['deriveBits', 'deriveKey'])
            .then(CryptoKeyToJsonWebKey)
    },
}
