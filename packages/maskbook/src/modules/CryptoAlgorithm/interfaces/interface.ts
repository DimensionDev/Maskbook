/**
 * Design goal:
 * - Minimal set of Crypto operations that Mask needs
 * - Independent of Web Crypto API
 * - Easy to implement for other languages (to WASM)
 * - Run in Web Worker to speed up
 * - Easy to compose different backend use spread(...) operator
 *
 * Function names: operation_algorithm_other
 * Signature:
 * - No native CryptoKey, JsonWebKey only
 */
import type { ECMethods } from './interface.ec'
import type { AESMethods } from './interface.aes'
import type { PBKDF2Methods } from './interface.pbkdf2'
import type { BlockChainMethods } from './interface.blockchain'
export interface CryptoAlgorithmProviderMethods extends AESMethods, ECMethods, PBKDF2Methods, BlockChainMethods {
    digest_sha(alg: ShaName, data: ArrayBuffer): PromiseLike<ArrayBuffer>
}
export type ShaName = 'SHA-256' // | 'SHA-384' | 'SHA-512'
