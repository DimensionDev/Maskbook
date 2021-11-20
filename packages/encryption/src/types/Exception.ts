import { Result, Err, Ok } from 'ts-results'

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

export class EKindsError<T> extends Error {
    constructor(private kind: T, private reason: unknown) {
        super(kind + '', { cause: reason })
    }
    override toString() {
        if (this.reason) return `${this.kind}\n${this.reason}`
        return super.toString()
    }
    static mapErr<E>(r: E) {
        return (e: unknown) => new EKindsError(r, e)
    }
    static withErr<P extends any[], T, E>(
        f: (...args: P) => Result<T, unknown>,
        o: E,
    ): (...args: P) => Result<T, EKindsError<E>>
    static withErr<P extends any[], T, E>(
        f: (...args: P) => Promise<Result<T, unknown>>,
        o: E,
    ): (...args: P) => Promise<Result<T, EKindsError<E>>>
    static withErr<P extends any[], T, E>(
        f: (...args: P) => Result<T, unknown> | Promise<Result<T, unknown>>,
        o: E,
    ): (...args: P) => Result<T, EKindsError<E>> | Promise<Result<T, EKindsError<E>>> {
        return (...args: P) => {
            const r = f(...args)
            if ('then' in r) return r.then((r) => r.mapErr(EKindsError.mapErr(o)))
            return r.mapErr(EKindsError.mapErr(o))
        }
    }
    toErr() {
        return Err(this)
    }
}

export function assertUint8Array<T>(x: unknown, name: string, kinds: T) {
    if (x instanceof Uint8Array) return Ok(x)
    if (x instanceof ArrayBuffer) return Ok(new Uint8Array(x))
    return new EKindsError(kinds, `${name} is not a Binary`).toErr()
}
export function assertArray<T>(name: string, kinds: T) {
    return (x: unknown) => {
        if (Array.isArray(x)) return Ok(x)
        return new EKindsError(kinds, `${name} is no an Array`).toErr()
    }
}
