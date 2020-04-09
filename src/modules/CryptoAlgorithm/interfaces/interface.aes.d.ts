export interface AESMethods {
    // length 128 or 192 is not used
    generate_aes_gcm(length: 256): PromiseLike<JsonWebKey>
    encrypt_aes_gcm(aes: JsonWebKey, iv: ArrayBuffer, message: ArrayBuffer): PromiseLike<ArrayBuffer>
    decrypt_aes_gcm(aes: JsonWebKey, iv: ArrayBuffer, message: ArrayBuffer): PromiseLike<ArrayBuffer>
}
export type AESName = 'AES-GCM' // | 'AES-CBC' | 'AES-CTR' | 'AES-KW'
