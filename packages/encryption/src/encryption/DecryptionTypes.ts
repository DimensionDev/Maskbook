import type { TypedMessage, ProfileIdentifier, AESCryptoKey, EC_Public_CryptoKey } from '@masknet/shared-base'
import type { PayloadParseResult } from '../payload'

export interface DecryptOptions {
    message: PayloadParseResult.Payload
    signal?: AbortSignal
}
export interface DecryptIO {
    /** Return the cached post key for this payload. */
    getPostKeyCache(): Promise<AESCryptoKey | null>
    /**
     * Store the post key into the cache so next time it will be much faster.
     * @param key Post AES key
     */
    setPostKeyCache(key: AESCryptoKey): Promise<void>
    /**
     * Checkout if the host has the local key of the given ProfileIdentifier.
     * @param author Author of this payload
     */
    hasLocalKeyOf(author: ProfileIdentifier): Promise<boolean>
    /**
     * Try to decrypt message by someone's localKey.
     *
     * Host must try authorHint's localKey if they have access to.
     *
     * Host may try other localKeys they owned even not listed in the authorHint.
     *
     * @param authorHint A hint for searching the localKey.
     * @param data Encrypted data
     * @param iv
     * @returns The decrypted data
     */
    decryptByLocalKey(authorHint: ProfileIdentifier | null, data: Uint8Array, iv: Uint8Array): Promise<Uint8Array>
    /**
     * If the author is null, the host should use some heuristic approach (e.g. where they found the post).
     * @param author ProfileIdentifier of the author. Might be empty.
     */
    queryAuthorPublicKey(author: ProfileIdentifier | null, signal?: AbortSignal): Promise<EC_Public_CryptoKey | null>
    /**
     * Query the key from the gun.
     *
     * Error from this function will become a fatal error.
     */
    queryPostKey_version40(iv: Uint8Array): Promise<DecryptStaticECDH_PostKey | null>
    /**
     * Query the key from the gun.
     *
     * This should be an infinite async iterator that listen to the gun network until the AbortSignal is triggered.
     *
     * Error from this function will become a fatal error.
     */
    queryPostKey_version39(iv: Uint8Array, signal?: AbortSignal): AsyncIterableIterator<DecryptStaticECDH_PostKey>
    /**
     * Query the key from the gun.
     *
     * This should be an infinite async iterator that listen to the gun network until the AbortSignal is triggered.
     *
     * Error from this function will become a fatal error.
     */
    queryPostKey_version38(iv: Uint8Array, signal?: AbortSignal): AsyncIterableIterator<DecryptStaticECDH_PostKey>
    /**
     * Query the key from the gun.
     *
     * This should be an infinite async iterator that listen to the gun network until the AbortSignal is triggered.
     *
     * Error from this function will become a fatal error.
     */
    queryPostKey_version37(iv: Uint8Array, signal?: AbortSignal): AsyncIterableIterator<DecryptEphemeralECDH_PostKey>
    /**
     * Derive a group of AES key for ECDH.
     *
     * Host should derive a new AES-GCM key for each private key they have access to.
     *
     * If the provided key cannot derive AES with any key (e.g. The given key is ED25519 but there is only P-256 private keys)
     * please return an empty array.
     *
     * Error from this function will become a fatal error.
     * @param publicKey The public key used in ECDH
     */
    deriveAESKey(publicKey: EC_Public_CryptoKey): Promise<AESCryptoKey[]>
}
export interface DecryptStaticECDH_PostKey {
    encryptedPostKey: Uint8Array
    postKeyIV: Uint8Array
}
export interface DecryptEphemeralECDH_PostKey extends DecryptStaticECDH_PostKey {
    // It might be contained in the original payload.
    ephemeralPublicKey?: EC_Public_CryptoKey
    ephemeralPublicKeySignature?: Uint8Array
}
export enum DecryptProgressKind {
    Started = 'started',
    Success = 'success',
    Error = 'error',
}
export type DecryptProgress = { type: DecryptProgressKind.Started } | DecryptSuccess | DecryptError
export interface DecryptSuccess {
    type: DecryptProgressKind.Success
    content: TypedMessage
}
enum ErrorReasons {
    PayloadBroken = '[@masknet/encryption] Payload is broken.',
    PayloadDecryptedButTypedMessageBroken = "[@masknet/encryption] Payload decrypted, but it's inner TypedMessage is broken.",
    CannotDecryptAsAuthor = '[@masknet/encryption] Failed decrypt as the author of this payload.',
    DecryptFailed = '[@masknet/encryption] Post key found, but decryption failed.',
    AuthorPublicKeyNotFound = "[@masknet/encryption] Cannot found author's public key",
    PrivateKeyNotFound = '[@masknet/encryption] Cannot continue to decrypt because there is no private key found.',
    NotShareTarget = '[@masknet/encryption] No valid key is found. Likely this post is not shared with you',
}
export class DecryptError extends Error {
    static Reasons = ErrorReasons
    readonly type = DecryptProgressKind.Error
    constructor(public override message: ErrorReasons, cause: any, public recoverable = false) {
        super(message, { cause })
    }
}
