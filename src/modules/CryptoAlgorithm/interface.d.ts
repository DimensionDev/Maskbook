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
export interface CryptoAlgorithmProviderMethods {
    digest_sha256(data: ArrayBuffer): PromiseLike<ArrayBuffer>
    encrypt_aes_gcm(aes: JsonWebKey, iv: ArrayBuffer, message: ArrayBuffer): PromiseLike<ArrayBuffer>
    decrypt_aes_gcm(aes: JsonWebKey, iv: ArrayBuffer, message: ArrayBuffer): PromiseLike<ArrayBuffer>
    sign_ecdsa_sha256(ecdsa_key: JsonWebKey, message: ArrayBuffer): PromiseLike<ArrayBuffer>
    verify_ecdsa_sha256(ecdsa_key: JsonWebKey, message: ArrayBuffer, signature: ArrayBuffer): PromiseLike<ArrayBuffer>
    generate_aes_gcm(): PromiseLike<JsonWebKey>
    generate_ecdh_k256_pair(): PromiseLike<JsonWebKeyPair>
    import_pbkdf2(seed: ArrayBuffer): PromiseLike<JsonWebKey>
    derive_aes_gcm256_from_ecdh_k256(priv: JsonWebKey, pub: JsonWebKey): PromiseLike<JsonWebKey>
    derive_aes_gcm256_from_pbkdf2(
        hash_algorithm: string,
        iterations: number,
        pbkdf: JsonWebKey,
        iv: ArrayBuffer,
    ): PromiseLike<JsonWebKey>
    /** Blockchain related fns */
    generate_ecdh_k256_from_mnemonic(password: string): PromiseLike<MnemonicWordDetail>
    recover_ecdh_k256_from_mnemonic(mnemonic: string, password: string): PromiseLike<MnemonicWordDetail>
}
export type MnemonicWordDetail = JsonWebKeyPair & {
    password: string
    mnemonic_words: string
    parameter_path: string
    parameter_with_password: string
}
