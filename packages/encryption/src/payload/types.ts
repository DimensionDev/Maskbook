// This file contains normalized Payload.
// Internal payload should not be exported
import {
    ProfileIdentifier,
    CheckedError,
    OptionalResult,
    EC_CryptoKey,
    EnhanceableSite,
    AESCryptoKey,
} from '@masknet/shared-base'
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
        readonly version: SupportedPayloadVersions
        readonly signature: OptionalField<Signature>
        /**
         * The claimed author of this payload.
         */
        readonly author: OptionalField<ProfileIdentifier, PayloadException>
        /**
         * The claimed public key of author.
         */
        readonly authorPublicKey: OptionalField<EC_Key, CryptoException>
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
        readonly AESKey: RequiredField<AESCryptoKey, CryptoException>
        readonly iv: RequiredField<Uint8Array>
    }
    /**
     * An E2E encrypted payload.
     */
    export interface EndToEndEncryption {
        readonly type: 'E2E'
        readonly ownersAESKeyEncrypted: RequiredField<Uint8Array>
        readonly iv: RequiredField<Uint8Array>
        readonly ephemeralPublicKey: Record<string, RequiredField<EC_Key, CryptoException>>
    }
}
/** Well formed payload that can be encoded into the latest version */
export declare namespace PayloadWellFormed {
    export interface Payload {
        readonly version: SupportedPayloadVersions
        readonly signature: Option<Signature>
        /**
         * The claimed author of this payload.
         */
        readonly author: Option<ProfileIdentifier>
        /**
         * The claimed public key of author.
         */
        readonly authorPublicKey: Option<EC_Key>
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
        /** The key used to encrypt the payload. It should be AES-256-GCM */
        readonly AESKey: AESCryptoKey
        readonly iv: Uint8Array
    }
    /**
     * An E2E encrypted payload.
     */
    export interface EndToEndEncryption {
        readonly type: 'E2E'
        readonly ownersAESKeyEncrypted: Uint8Array
        readonly iv: Uint8Array
        readonly ephemeralPublicKey: Map<EC_KeyCurveEnum, CryptoKey>
    }
}
export interface Signature {
    readonly signee: Uint8Array
    readonly signature: Uint8Array
}
export interface EC_Key<K extends EC_CryptoKey = EC_CryptoKey> {
    readonly algr: EC_KeyCurveEnum
    readonly key: K
}
export enum EC_KeyCurveEnum {
    // ed25519 = 0, Ed25519 is not supported by WebCrypto. Don't have a standard name, but maybe "Ed25519"
    // https://github.com/tQsW/webcrypto-curve25519/blob/master/explainer.md
    secp256p1 = 1, // P-256
    secp256k1 = 2, // K-256
}
export enum SocialNetworkEnum {
    Unknown = -1,
    Facebook = 0,
    Twitter = 1,
    Instagram = 2,
    Minds = 3,
}
/**
 * Version starts from -42 but -42 and -41 are dropped.
 *
 * The latest version is -37.
 */
export type SupportedPayloadVersions = -37 | -38 | -39 | -40
const SocialNetworkEnumToDomain: Record<SocialNetworkEnum, string> = {
    [SocialNetworkEnum.Unknown]: EnhanceableSite.Localhost,
    [SocialNetworkEnum.Facebook]: EnhanceableSite.Facebook,
    [SocialNetworkEnum.Minds]: EnhanceableSite.Minds,
    [SocialNetworkEnum.Twitter]: EnhanceableSite.Twitter,
    [SocialNetworkEnum.Instagram]: EnhanceableSite.Instagram,
}
export function SocialNetworkEnumToProfileDomain(x: SocialNetworkEnum) {
    return SocialNetworkEnumToDomain[x]
}
