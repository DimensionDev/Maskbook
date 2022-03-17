import type {
    ProfileIdentifier,
    EC_Public_CryptoKey,
    AESCryptoKey,
    EC_Private_CryptoKey,
    PostIVIdentifier,
    IdentifierMap,
} from '@masknet/shared-base'
import type { SerializableTypedMessages } from '@masknet/typed-message'
import type { EC_Key, EC_KeyCurveEnum } from '../payload'

export interface EncryptOptions {
    /** Payload version to use. */
    version: -38 | -37
    /** Current author who started the encryption. */
    author: ProfileIdentifier
    /** The message to be encrypted. */
    message: SerializableTypedMessages
    /** Encryption target. */
    target: EncryptTargetPublic | EncryptTargetE2E
}
export interface EncryptTargetPublic {
    type: 'public'
}
export interface EncryptTargetE2E {
    type: 'E2E'
    target: ProfileIdentifier[]
}
export interface EncryptIO {
    queryPublicKey(persona: ProfileIdentifier): Promise<EC_Key<EC_Public_CryptoKey> | null>
    /**
     * This is only used in v38.
     *
     * Note: Due to historical reason (misconfiguration), some user may not have localKey.
     *
     * Throw in this case. v37 will resolve this problem.
     */
    encryptByLocalKey(content: Uint8Array, iv: Uint8Array): Promise<Uint8Array>
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
     * If any of keys is not secp256k1, please throw an error.
     *
     * Error from this function will become a fatal error.
     * @param publicKey The public key used in ECDH
     */
    deriveAESKey_version38_or_older(
        publicKey: EC_Public_CryptoKey,
    ): Promise<{ aes: AESCryptoKey; iv: Uint8Array; ivToBePublished: Uint8Array }>
    /**
     * Fill the arr with random values.
     * This should be only provided in the test environment to create a deterministic result.
     */
    getRandomValues?(arr: Uint8Array): Uint8Array
    /**
     * Generate a new AES Key.
     * This should be only provided in the test environment to create a deterministic result.
     */
    getRandomAESKey?(): Promise<AESCryptoKey>
    /**
     * Generate a pair of new EC key used for ECDH.
     * This should be only provided in the test environment to create a deterministic result.
     */
    getRandomECKey?(algr: EC_KeyCurveEnum): Promise<readonly [EC_Public_CryptoKey, EC_Private_CryptoKey]>
}
export interface EncryptResult {
    postKey: AESCryptoKey
    output: string | Uint8Array
    identifier: PostIVIdentifier
    author: ProfileIdentifier
    /** Additional information that need to be send to the internet in order to allow recipients to decrypt */
    e2e?: IdentifierMap<ProfileIdentifier, PromiseSettledResult<EncryptionResultE2E>>
}
export interface EncryptionResultE2E {
    target: ProfileIdentifier
    encryptedPostKey: Uint8Array
    /** This is used in v38. */
    ivToBePublished?: Uint8Array
    /** This feature is supported since v37. */
    ephemeralPublicKey?: EC_Public_CryptoKey
}
export enum EncryptErrorReasons {
    ComplexTypedMessageNotSupportedInPayload38 = '[@masknet/encryption] Complex TypedMessage is not supported in payload v38.',
    PublicKeyNotFound = '[@masknet/encryption] Target public key not found.',
}
export class EncryptError extends Error {
    static Reasons = EncryptErrorReasons
    constructor(public override message: EncryptErrorReasons, cause?: any) {
        super(message, { cause })
    }
}
