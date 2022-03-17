import type { TypedMessage } from '@masknet/typed-message'
import type { ProfileIdentifier, AESCryptoKey, EC_Public_CryptoKey } from '@masknet/shared-base'
import type { PayloadParseResult, SupportedPayloadVersions } from '../payload'
import { registerSerializableClass } from '@masknet/shared-base'

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
     * Derive a group of AES key by ECDH(selfPriv, targetPub).
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
    /**
     * Derive a group of AES key for ECDH.
     *
     * !! Note: This part is not simple ECDH.
     *
     * !! For the compatibility, you should refer to the original implementation:
     *
     * !! https://github.com/DimensionDev/Maskbook/blob/f3d83713d60dd0aad462e0648c4d38586c106edc/packages/mask/src/crypto/crypto-alpha-40.ts#L29-L58
     *
     * Host should derive a new AES-GCM key for each private key they have access to.
     *
     * If the provided key cannot derive AES with any key (e.g. The given key is ED25519 but there is only P-256 private keys)
     * please return an empty array.
     *
     * Error from this function will become a fatal error.
     * @param publicKey The public key used in ECDH
     * @param iv The IV used to generate new set of IVs
     */
    deriveAESKey_version38_or_older(
        publicKey: EC_Public_CryptoKey,
        iv: Uint8Array,
    ): Promise<[aes: AESCryptoKey, iv: Uint8Array][]>
}
export interface DecryptStaticECDH_PostKey {
    encryptedPostKey: Uint8Array
    postKeyIV: Uint8Array
}
export interface DecryptEphemeralECDH_PostKey {
    encryptedPostKey: Uint8Array
    postKeyIV?: Uint8Array
    // It might be contained in the original payload.
    ephemeralPublicKey?: EC_Public_CryptoKey
    ephemeralPublicKeySignature?: Uint8Array
}
export enum DecryptProgressKind {
    Success = 'success',
    Error = 'error',
    Info = 'info',
    Progress = 'progress',
}
export interface DecryptIntermediateProgress {
    type: DecryptProgressKind.Progress
    event: DecryptIntermediateProgressKind
}
export type DecryptProgress = DecryptSuccess | DecryptError | DecryptIntermediateProgress | DecryptReportedInfo
export interface DecryptReportedInfo {
    type: DecryptProgressKind.Info
    iv?: Uint8Array
    claimedAuthor?: ProfileIdentifier
    publicShared?: boolean
    version?: SupportedPayloadVersions
    ownersKeyEncrypted?: Uint8Array
}
export interface DecryptIntermediateProgress {
    type: DecryptProgressKind.Progress
    event: DecryptIntermediateProgressKind
}
export enum DecryptIntermediateProgressKind {
    TryDecryptByE2E = 'E2E',
}
export interface DecryptSuccess {
    type: DecryptProgressKind.Success
    content: TypedMessage
}
// TODO: rename as DecryptErrorReasons
export enum ErrorReasons {
    PayloadBroken = '[@masknet/encryption] Payload is broken.',
    PayloadDecryptedButTypedMessageBroken = "[@masknet/encryption] Payload decrypted, but it's inner TypedMessage is broken.",
    CannotDecryptAsAuthor = '[@masknet/encryption] Failed decrypt as the author of this payload.',
    DecryptFailed = '[@masknet/encryption] Post key found, but decryption failed.',
    AuthorPublicKeyNotFound = "[@masknet/encryption] Cannot found author's public key",
    PrivateKeyNotFound = '[@masknet/encryption] Cannot continue to decrypt because there is no private key found.',
    NotShareTarget = '[@masknet/encryption] No valid key is found. Likely this post is not shared with you',
    // Not used in this library.
    UnrecognizedAuthor = '[@masknet/encryption] No author is recognized which is required for the image steganography decoding.',
    CurrentProfileDoesNotConnectedToPersona = '[@masknet/encryption] Cannot decrypt by E2E because no persona is linked with the current profile.',
    NoPayloadFound = '[@masknet/encryption] No payload found in this material.',
}
export class DecryptError extends Error {
    static Reasons = ErrorReasons
    readonly type = DecryptProgressKind.Error
    constructor(public override message: ErrorReasons, cause: any, public recoverable = false) {
        super(message, { cause })
    }
}
registerSerializableClass(
    'MaskDecryptError',
    (x) => x instanceof DecryptError,
    (e: DecryptError) => ({
        cause: (e as any).cause,
        recoverable: e.recoverable,
        message: e.message,
        stack: e.stack,
    }),
    (o) => {
        const e = new DecryptError(o.message, o.cause, o.recoverable)
        e.stack = o.stack
        return e
    },
)
