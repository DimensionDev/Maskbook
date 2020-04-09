import { ShaName } from './interface'
import { AESName } from './interface.aes'
export interface PBKDF2Methods {
    import_pbkdf2(seed: ArrayBuffer): PromiseLike<JsonWebKey>
    derive_aes_from_pbkdf2(
        pbkdf: JsonWebKey,
        iv: ArrayBuffer,
        sha_algr: ShaName,
        aes_algr: AESName,
        aes_length: 256,
        iterations: number,
    ): PromiseLike<JsonWebKey>
}
