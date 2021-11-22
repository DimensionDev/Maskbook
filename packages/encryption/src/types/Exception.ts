import { CheckedError } from '@masknet/shared-base/src/Results/CheckedError'
import { Ok } from 'ts-results'

export enum CryptoException {
    InvalidCryptoKey = '[@masknet/encryption] Encountered an invalid CryptoKey.',
    EncryptFailed = '[@masknet/encryption] Failed to encrypt.',
    DecryptFailed = '[@masknet/encryption] Failed to decrypt.',
    UnsupportedAlgorithm = '[@masknet/encryption] Unsupported crypto algorithm.',
    InvalidIVLength = '[@masknet/encryption] IV length must be 16.',
}
export enum PayloadException {
    EncodeFailed = '[@masknet/encryption] Failed to encode the payload.',
    DecodeFailed = '[@masknet/encryption] Failed to decode the payload.',
    InvalidPayload = '[@masknet/encryption] Payload decoded, but it violates the schema.',
    UnknownEnumMember = '[@masknet/encryption] Payload includes an unknown enum member.',
    UnknownVersion = '[@masknet/encryption] Unsupported payload version.',
}

export function assertUint8Array<T>(x: unknown, name: string, kinds: T) {
    if (x instanceof Uint8Array) return Ok(x)
    if (x instanceof ArrayBuffer) return Ok(new Uint8Array(x))
    return new CheckedError(kinds, `${name} is not a Binary`).toErr()
}
export function assertArray<T>(name: string, kinds: T) {
    return (x: unknown) => {
        if (Array.isArray(x)) return Ok(x)
        return new CheckedError(kinds, `${name} is no an Array`).toErr()
    }
}
