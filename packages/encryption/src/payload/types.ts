// This file contains normalized Payload.
// Internal payload should not be exported
import type { ProfileIdentifier } from '@masknet/shared-base'
import type { Result, Option } from 'ts-results'
import type { DecodeExceptions, Exception, ExceptionKinds, OptionalResult } from '../types'

/** A parse result, that try to preserve as many info as possible. */
export declare namespace PayloadParseResult {
    type OptionalField<T, E extends ExceptionKinds = DecodeExceptions> = OptionalResult<T, DecodeExceptions | E>
    type RequiredField<T, E extends ExceptionKinds = DecodeExceptions> = Result<T, Exception<DecodeExceptions | E>>
    type DecodeErr = Exception<DecodeExceptions>
    export type CryptoKeyErr = DecodeExceptions | ExceptionKinds.UnknownEnumMember | ExceptionKinds.InvalidCryptoKey
    export interface Payload {
        /**
         * Version starts from -42 but -42 and -41 are dropped.
         *
         * The latest version is -37.
         */
        version: -40 | -39 | -38 | -37
        signature: OptionalField<Signature>
        /**
         * The claimed author of this payload.
         */
        author: OptionalField<ProfileIdentifier, ExceptionKinds.UnknownEnumMember>
        /**
         * The claimed public key of author.
         */
        authorPublicKey: OptionalField<AsymmetryCryptoKey, CryptoKeyErr>
        /** The encryption method this payload used. */
        encryption: RequiredField<PublicEncryption | EndToEndEncryption>
        /** The encrypted content. */
        encrypted: RequiredField<ArrayBuffer>
    }
    /**
     * A publicly encrypted payload.
     */
    export interface PublicEncryption {
        type: 'public'
        AESKey: RequiredField<AESKey, CryptoKeyErr>
        iv: RequiredField<ArrayBuffer>
    }
    /**
     * An E2E encrypted payload.
     */
    export interface EndToEndEncryption {
        type: 'E2E'
        ownersAESKeyEncrypted: RequiredField<ArrayBuffer>
        iv: RequiredField<ArrayBuffer>
        ephemeralPublicKey: readonly RequiredField<AsymmetryCryptoKey, CryptoKeyErr>[]
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
        version: -40 | -39 | -38 | -37
        signature: Option<Signature>
        /**
         * The claimed author of this payload.
         */
        author: Option<ProfileIdentifier>
        /**
         * The claimed public key of author.
         */
        authorPublicKey: Option<AsymmetryCryptoKey>
        /** The encryption method this payload used. */
        encryption: PublicEncryption | EndToEndEncryption
        /** The encrypted content. */
        encrypted: ArrayBuffer
    }
    /**
     * A publicly encrypted payload.
     */
    export interface PublicEncryption {
        type: 'public'
        AESKey: AESKey
        iv: ArrayBuffer
    }
    /**
     * An E2E encrypted payload.
     */
    export interface EndToEndEncryption {
        type: 'E2E'
        ownersAESKeyEncrypted: ArrayBuffer
        iv: ArrayBuffer
        ephemeralPublicKey: Map<PublicKeyAlgorithmEnum, CryptoKey>
    }
}
export type Signature = readonly [signee: ArrayBuffer, signature: ArrayBuffer]
export type AsymmetryCryptoKey = readonly [algr: PublicKeyAlgorithmEnum, key: CryptoKey]
export type AESKey = readonly [param: AESKeyParameterEnum, key: CryptoKey]
export enum PublicKeyAlgorithmEnum {
    ed25519 = 0,
    secp256p1 = 1, // P-256
    secp256k1 = 2, // K-256
}
export enum AESKeyParameterEnum {
    AES_GCM_256,
}
