// This file is the entry for external usage.
export {
    encodePayload,
    parsePayload,
    EC_KeyCurveEnum,
    SocialNetworkEnum,
    SocialNetworkEnumToProfileDomain,
    type EC_Key,
    type Signature,
    type PayloadParseResult,
    type PayloadWellFormed,
    type SupportedPayloadVersions,
} from './payload/index.js'

export {
    decrypt,
    DecryptError,
    DecryptProgressKind,
    DecryptIntermediateProgressKind,
    DecryptErrorReasons,
    type DecryptOptions,
    type DecryptIO,
    type DecryptEphemeralECDH_PostKey,
    type DecryptStaticECDH_PostKey,
    type DecryptProgress,
    type DecryptIntermediateProgress,
    type DecryptReportedInfo,
    type DecryptSuccess,
} from './encryption/index.js'

export { socialNetworkEncoder, socialNetworkDecoder } from './social-network-encode-decode/index.js'

export { type TypedMessage, type Meta } from '../../typed-message/dist/base/index.js'
export * from '../../typed-message/dist/base/core/index.js'
export {
    ProfileIdentifier,
    PostIVIdentifier,
    CheckedError,
    OptionalResult,
    type AESCryptoKey,
    type EC_Public_CryptoKey,
    type EC_Private_CryptoKey,
    type EC_CryptoKey,
} from '@masknet/shared-base'

export * from 'ts-results-es'
