// This file contains normalized Payload.
// Internal payload should not be exported
import type { ProfileIdentifier } from '@masknet/shared-base'
import type { Result, Option } from 'ts-results'
import type { DecodeExceptions, EKindsError as Err, EKinds, OptionalResult } from '../types'

/** A parse result, that try to preserve as many info as possible. */
export declare namespace PayloadParseResult {
    export type OptionalField<T, E extends EKinds = DecodeExceptions> = OptionalResult<T, DecodeExceptions | E>
    export type RequiredField<T, E extends EKinds = DecodeExceptions> = Result<T, Err<DecodeExceptions | E>>
    export type CryptoKeyException = DecodeExceptions | EKinds.UnsupportedAlgorithm | EKinds.InvalidCryptoKey
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
        readonly author: OptionalField<ProfileIdentifier, EKinds.UnknownEnumMember>
        /**
         * The claimed public key of author.
         */
        readonly authorPublicKey: OptionalField<AsymmetryCryptoKey, CryptoKeyException>
        /** The encryption method this payload used. */
        readonly encryption: RequiredField<PublicEncryption | EndToEndEncryption>
        /** The encrypted content. */
        readonly encrypted: RequiredField<ArrayBuffer>
    }
    /**
     * A publicly encrypted payload.
     */
    export interface PublicEncryption {
        readonly type: 'public'
        readonly AESKey: RequiredField<AESKey, CryptoKeyException>
        readonly iv: RequiredField<ArrayBuffer>
    }
    /**
     * An E2E encrypted payload.
     */
    export interface EndToEndEncryption {
        readonly type: 'E2E'
        readonly ownersAESKeyEncrypted: RequiredField<ArrayBuffer>
        readonly iv: RequiredField<ArrayBuffer>
        readonly ephemeralPublicKey: Record<string, RequiredField<AsymmetryCryptoKey, CryptoKeyException>>
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
        readonly encrypted: ArrayBuffer
    }
    /**
     * A publicly encrypted payload.
     */
    export interface PublicEncryption {
        readonly type: 'public'
        readonly AESKey: AESKey
        readonly iv: ArrayBuffer
    }
    /**
     * An E2E encrypted payload.
     */
    export interface EndToEndEncryption {
        readonly type: 'E2E'
        readonly ownersAESKeyEncrypted: ArrayBuffer
        readonly iv: ArrayBuffer
        readonly ephemeralPublicKey: Map<PublicKeyAlgorithmEnum, CryptoKey>
    }
}
export interface Signature {
    readonly signee: ArrayBuffer
    readonly signature: ArrayBuffer
}
export type AsymmetryCryptoKey = readonly [algr: PublicKeyAlgorithmEnum, key: CryptoKey]
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
    AES_GCM_256 = 'AES_GCM_256',
}
