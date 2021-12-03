import type { TypedMessage, ProfileIdentifier, AESCryptoKey, EC_Public_CryptoKey } from '@masknet/shared-base'
import type { PayloadParseResult } from '../payload'

export interface DecryptionOption {
    message: PayloadParseResult.Payload
    signal?: AbortSignal
}
export interface DecryptIO {
    getPostKeyCache(): Promise<AESCryptoKey | null>
    setPostKeyCache(key: AESCryptoKey): Promise<void>
    hasLocalKeyOf(author: ProfileIdentifier): Promise<boolean>
    /**
     * Try to decrypt message by someone's localKey.
     *
     * Implementor must try authorHint's localKey if they have access to.
     *
     * Implementor may try other localKeys they owned even not listed in the authorHint.
     *
     * @param authorHint A hint for searching the localKey.
     * @param data Encrypted data
     * @param iv
     * @returns The decrypted data
     */
    decryptByLocalKey(authorHint: ProfileIdentifier | null, data: Uint8Array, iv: Uint8Array): Promise<Uint8Array>
    queryPublicKey(id: ProfileIdentifier | null, signal?: AbortSignal): Promise<EC_Public_CryptoKey>
    queryPostKey_version40(iv: Uint8Array): Promise<StaticECDH_Result | null>
    queryPostKey_version39(iv: Uint8Array, signal?: AbortSignal): AsyncIterableIterator<StaticECDH_Result>
    queryPostKey_version38(iv: Uint8Array, signal?: AbortSignal): AsyncIterableIterator<StaticECDH_Result>
    queryPostKey_version37(iv: Uint8Array, signal?: AbortSignal): AsyncIterableIterator<EphemeralECDH_Result>
    /**
     * Derive a group of AES key for ECDH.
     *
     * Implementor should derive a new AES-GCM key for each private key they have access to.
     * @param publicKey The public key used in ECDH
     * @returns This function MUST NOT throw an error. Error will be treated as fatal error.
     *
     * If the provided key cannot derive AES with any key (e.g. The given key is ED25519 but there is only P-256 private keys)
     * please return an empty array.
     */
    deriveAESKey(publicKey: EC_Public_CryptoKey): Promise<AESCryptoKey[]>
}
export interface StaticECDH_Result {
    encryptedKey: Uint8Array
    iv: Uint8Array
}
export interface EphemeralECDH_Result extends StaticECDH_Result {
    // It might be contained in the original payload.
    ephemeralPublicKey?: EC_Public_CryptoKey
    ephemeralPublicKeySignature?: Uint8Array
}
export enum DecryptionProgressKind {
    Started = 'started',
    Success = 'success',
    Error = 'error',
}
export type DecryptionProcess = { type: DecryptionProgressKind.Started } | DecryptionSuccess | DecryptionError
export interface DecryptionSuccess {
    type: DecryptionProgressKind.Success
    content: TypedMessage
}
enum ErrorReasons {
    PayloadBroken = '[@masknet/encryption] Payload is broken.',
    PayloadDecryptedButNoValidTypedMessageIsFound = '[@masknet/encryption] Payload decrypted, but no valid TypedMessage is found.',
    CannotDecryptAsAuthor = '[@masknet/encryption] Failed decrypt as the author of this payload.',
    DecryptFailed = '[@masknet/encryption] Post key found, but decryption failed.',
    AuthorPublicKeyNotFound = "[@masknet/encryption] Cannot found author's public key",
    MyPrivateKeyNotFound = '[@masknet/encryption] Cannot decrypt because there is no private key found.',
    NotShareTarget = '[@masknet/encryption] No valid key is found. Likely this post is not shared with you',
    Aborted = '[@masknet/encryption] Task aborted.',
}
export class DecryptionError extends Error {
    static Reasons = ErrorReasons
    readonly type = DecryptionProgressKind.Error
    constructor(public override message: ErrorReasons, cause: unknown, public recoverable = false) {
        super(message, { cause })
    }
}
