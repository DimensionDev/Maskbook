/**
 * Design goal:
 * - Minimal set of Crypto operations that Maskbook needs
 * - Independent of Web Crypto API
 * - Easy to implement for other languages (to WASM)
 * - Run in Web Worker to speed up
 *
 * Function names: operation_algorithm_other
 * Signature:
 * - All ArrayBuffer appears in the end
 * - No native CryptoKey, JsonWebKey only
 */
export type JsonWebKeyPair = { public: JsonWebKeyPair; private: JsonWebKeyPair }
export declare function digest_sha256(data: ArrayBuffer): Promise<ArrayBuffer>
export declare function encrypt_aes_gcm(aes: JsonWebKey, iv: ArrayBuffer, message: ArrayBuffer): Promise<ArrayBuffer>
export declare function decrypt_aes_gcm(aes: JsonWebKey, iv: ArrayBuffer, message: ArrayBuffer): Promise<ArrayBuffer>
export declare function sign_ecdsa_sha256(ecdsa_key: JsonWebKey, message: ArrayBuffer): Promise<ArrayBuffer>
export declare function verify_ecdsa_sha256(ecdsa_key: JsonWebKey, message: ArrayBuffer): Promise<ArrayBuffer>
export declare function generate_aes_gcm(): Promise<JsonWebKey>
export declare function generate_ecdh_k256_pair(): Promise<JsonWebKeyPair>
export declare function import_pbkdf2(seed: ArrayBuffer): Promise<JsonWebKey>
export declare function derive_aes_gcm256_from_ecdh_k256(priv: JsonWebKey, pub: JsonWebKey): Promise<JsonWebKey>
export declare function derive_aes_gcm256_from_pbkdf2(
    hash_algorithm: string,
    iterations: number,
    pbkdf: JsonWebKey,
    iv: ArrayBuffer,
): Promise<void>
/** Blockchain related fns */
export type MnemonicWordDetail = JsonWebKeyPair & {
    password: string
    mnemonic_words: string
    parameter_path: string
    parameter_with_password: string
}
export declare function generate_ecdh_k256_from_mnemonic(password: string): Promise<MnemonicWordDetail>
export declare function recover_ecdh_k256_from_mnemonic(mnemonic: string, password: string): Promise<MnemonicWordDetail>
