import type { AESJsonWebKey } from '@masknet/shared-base'

export interface AESMethods {
    // length 128 or 192 is not used
    generate_aes_gcm(length?: 256): PromiseLike<AESJsonWebKey>
    encrypt_aes_gcm(aes: AESJsonWebKey, iv: ArrayBuffer, message: ArrayBuffer): PromiseLike<ArrayBuffer>
    decrypt_aes_gcm(aes: AESJsonWebKey, iv: ArrayBuffer, message: ArrayBuffer): PromiseLike<ArrayBuffer>
    aes_to_raw(aes: AESJsonWebKey): PromiseLike<ArrayBuffer>
    raw_to_aes(raw: ArrayBuffer): PromiseLike<AESJsonWebKey>
}
export type AESName = 'AES-GCM' // | 'AES-CBC' | 'AES-CTR' | 'AES-KW'
