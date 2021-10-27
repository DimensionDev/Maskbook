import { Result, Err } from 'ts-results'

export enum EKinds {
    DecodeFailed = '[@masknet/encryption] Failed to decode the payload.',
    InvalidPayload = '[@masknet/encryption] Payload decoded, but it violates the schema.',
    UnknownEnumMember = '[@masknet/encryption] Payload includes an unknown enum member.',
    InvalidCryptoKey = '[@masknet/encryption] Payload contains an invalid CryptoKey.',
    DecryptFailed = '[@masknet/encryption] Failed to decrypt.',
    UnsupportedAlgorithm = '[@masknet/encryption] Unsupported crypto algorithm.',
}

export class EKindsError<T extends EKinds> extends Error {
    constructor(kind: T, reason: unknown) {
        // @ts-expect-error error cause proposal
        super(kind, { cause: reason })
    }
    static mapErr<E extends EKinds>(r: E) {
        return (e: unknown) => new EKindsError(r, e)
    }
    static withErr<P extends any[], T, E extends EKinds>(
        f: (...args: P) => Result<T, unknown>,
        o: E,
    ): (...args: P) => Result<T, EKindsError<E>>
    static withErr<P extends any[], T, E extends EKinds>(
        f: (...args: P) => Promise<Result<T, unknown>>,
        o: E,
    ): (...args: P) => Promise<Result<T, EKindsError<E>>>
    static withErr<P extends any[], T, E extends EKinds>(
        f: (...args: P) => Result<T, unknown> | Promise<Result<T, unknown>>,
        o: E,
    ): (...args: P) => Result<T, EKindsError<E>> | Promise<Result<T, EKindsError<E>>> {
        return (...args: P) => {
            const r = f(...args)
            if (r instanceof Promise) return r.then((r) => r.mapErr(EKindsError.mapErr(o)))
            return r.mapErr(EKindsError.mapErr(o))
        }
    }
    toErr() {
        return Err(this)
    }
}
