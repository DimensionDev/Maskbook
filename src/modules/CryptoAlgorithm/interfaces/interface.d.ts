/**
 * Design goal:
 * - Minimal set of Crypto operations that Maskbook needs
 * - Independent of Web Crypto API
 * - Easy to implement for other languages (to WASM)
 * - Run in Web Worker to speed up
 * - Easy to compose different backend use spread(...) operator
 *
 * Function names: operation_algorithm_other
 * Signature:
 * - No native CryptoKey, JsonWebKey only
 */
import { ECMethods } from './interface.ec'
import { AESMethods } from './interface.aes'
import { PBKDF2Methods } from './interface.pbkdf2'
import type { BlockChainMethods } from './interface.blockchain'
export type JsonWebKeyPair = { public: JsonWebKek; private: JsonWebKey }
export interface CryptoAlgorithmProviderMethods extends AESMethods, ECMethods, PBKDF2Methods, BlockChainMethods {
    digest_sha(alg: ShaName, data: ArrayBuffer): PromiseLike<ArrayBuffer>
}
export type ShaName = 'SHA-256' // | 'SHA-384' | 'SHA-512'
