import type {
    ProfileIdentifier,
    EC_Public_CryptoKey,
    AESCryptoKey,
    EC_Private_CryptoKey,
    PostIVIdentifier,
} from '@masknet/base'
import type { SerializableTypedMessages } from '@masknet/typed-message'
import type { EC_Key, EC_KeyCurve } from '../payload/index.js'
import type { Option } from 'ts-results-es'

export interface EncryptOptions {
    /** Payload version to use. */
    version: -38 | -37
    /** Current author who started the encryption. */
    author: Option<ProfileIdentifier>
    /** Public key of the current author. */
    authorPublicKey: Option<EC_Key<EC_Public_CryptoKey>>
    /** Network of the encryption */
    network: string
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
    target: ReadonlyArray<EC_Key<EC_Public_CryptoKey>>
}
export interface EncryptIO {
    /**
     * This is only used in v38.
     *
     * Note: Due to historical reason (misconfiguration), some user may not have localKey.
     *
     * Throw in this case.
     */
    encryptByLocalKey(content: Uint8Array, iv: Uint8Array): Promise<Uint8Array | ArrayBuffer>
    /**
     * Derive a group of AES key by ECDH(selfPriv, targetPub).
     *
     * Host should derive a new AES-GCM key for each private key they have access to.
     *
     * If the provided key cannot derive AES with any key (e.g. The given key is ED25519 but there is only P-256 private keys)
     * please throw an error.
     *
     * Error from this function will become a fatal error.
     * This is only used in v38 or older
     *
     * @param publicKey The public key used in ECDH
     */
    deriveAESKey(publicKey: EC_Public_CryptoKey): Promise<AESCryptoKey>
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
    getRandomECKey?(algr: EC_KeyCurve): Promise<readonly [EC_Public_CryptoKey, EC_Private_CryptoKey]>
}
export interface EncryptResult {
    postKey: AESCryptoKey
    output: string | Uint8Array
    identifier: PostIVIdentifier
    author?: ProfileIdentifier
    e2e?: EncryptionResultE2EMap
}
/** Additional information that need to be send to the internet in order to allow recipients to decrypt */
export type EncryptionResultE2EMap = Map<EC_Key<EC_Public_CryptoKey>, PromiseSettledResult<EncryptionResultE2E>>
export interface EncryptionResultE2E {
    target: EC_Key<EC_Public_CryptoKey>
    encryptedPostKey: Uint8Array
    /** This is used in v38. */
    ivToBePublished?: Uint8Array
    /** This feature is supported since v37. */
    ephemeralPublicKey?: EC_Public_CryptoKey
}
