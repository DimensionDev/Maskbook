// This file contains normalized Payload.
// Internal payload should not be exported
import type { ProfileIdentifier, CheckedError, OptionalResult } from '@masknet/shared-base'
import type { Result, Option } from 'ts-results'
import type { CryptoException, PayloadException } from '../types'

/** A parse result, that try to preserve as many info as possible. */
export declare namespace PayloadParseResult {
    export type OptionalField<
        T,
        E extends CryptoException | PayloadException = CryptoException | PayloadException,
    > = OptionalResult<T, E>
    export type RequiredField<
        T,
        E extends CryptoException | PayloadException = CryptoException | PayloadException,
    > = Result<T, CheckedError<E>>
    export interface Payload {
        /**
         * Version starts from -42 but -42 and -41 are dropped.
         *
         * The latest version is -37.
         */
        readonly version: -40 | -39 | -38 | -37
        readonly signature: OptionalField<Signature>
        /**
         * The claimed author of this payload.
         */
        readonly author: OptionalField<ProfileIdentifier, PayloadException>
        /**
         * The claimed public key of author.
         */
        readonly authorPublicKey: OptionalField<AsymmetryCryptoKey, CryptoException>
        /** The encryption method this payload used. */
        readonly encryption: RequiredField<PublicEncryption | EndToEndEncryption>
        /** The encrypted content. */
        readonly encrypted: RequiredField<Uint8Array>
    }
    /**
     * A publicly encrypted payload.
     */
    export interface PublicEncryption {
        readonly type: 'public'
        readonly AESKey: RequiredField<AESKey, CryptoException>
        readonly iv: RequiredField<Uint8Array>
    }
    /**
     * An E2E encrypted payload.
     */
    export interface EndToEndEncryption {
        readonly type: 'E2E'
        readonly ownersAESKeyEncrypted: RequiredField<Uint8Array>
        readonly iv: RequiredField<Uint8Array>
        readonly ephemeralPublicKey: Record<string, RequiredField<AsymmetryCryptoKey, CryptoException>>
    }
}
/** Well formed payload that can be encoded into the latest version */
export declare namespace PayloadWellFormed {
    export interface Payload {
        /**
         * Version starts from -42 but -42 and -41 are dropped.
         *
         * The latest version is -37.
         */
        readonly version: -40 | -39 | -38 | -37
        readonly signature: Option<Signature>
        /**
         * The claimed author of this payload.
         */
        readonly author: Option<ProfileIdentifier>
        /**
         * The claimed public key of author.
         */
        readonly authorPublicKey: Option<AsymmetryCryptoKey>
        /** The encryption method this payload used. */
        readonly encryption: PublicEncryption | EndToEndEncryption
        /** The encrypted content. */
        readonly encrypted: Uint8Array
    }
    /**
     * A publicly encrypted payload.
     */
    export interface PublicEncryption {
        readonly type: 'public'
        /** The key used to encrypt the payload. */
        readonly AESKey: AESKey
        readonly iv: Uint8Array
    }
    /**
     * An E2E encrypted payload.
     */
    export interface EndToEndEncryption {
        readonly type: 'E2E'
        readonly ownersAESKeyEncrypted: Uint8Array
        readonly iv: Uint8Array
        readonly ephemeralPublicKey: Map<PublicKeyAlgorithmEnum, CryptoKey>
    }
}
export interface Signature {
    readonly signee: Uint8Array
    readonly signature: Uint8Array
}
export interface AsymmetryCryptoKey {
    readonly algr: PublicKeyAlgorithmEnum
    readonly key: CryptoKey
}
export interface AESKey {
    readonly algr: AESAlgorithmEnum
    readonly key: CryptoKey
}
export enum PublicKeyAlgorithmEnum {
    ed25519 = 0,
    secp256p1 = 1, // P-256
    secp256k1 = 2, // K-256
}
export enum AESAlgorithmEnum {
    A256GCM = 'A256GCM',
}
export enum SocialNetworkEnum {
    Facebook = 0,
    Twitter = 1,
    Instagram = 2,
    Minds = 3,
}
