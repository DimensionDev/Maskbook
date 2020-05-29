import type { ShaName } from './interface'
import type { AESName } from './interface.aes'
import type { PBKDF2UnknownKey, AESJsonWebKey } from './utils'
export interface PBKDF2Methods {
    import_pbkdf2(seed: ArrayBuffer): PromiseLike<PBKDF2UnknownKey>
    derive_aes_from_pbkdf2(
        pbkdf: PBKDF2UnknownKey,
        iv: ArrayBuffer,
        sha_algr: ShaName,
        aes_algr: AESName,
        aes_length: 256,
        iterations: number,
    ): PromiseLike<AESJsonWebKey>
}
