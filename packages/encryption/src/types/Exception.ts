import { Result, Err } from 'ts-results'

export enum ExceptionKinds {
    /** Failed while decode the payload */
    DecodeFailed,
    /** The payload succeed to decode, but violates the Payload schema. */
    InvalidPayload,
    /** The payload contains an unknown enum member. */
    UnknownEnumMember,
    /** The payload contains an invalid CryptoKey */
    InvalidCryptoKey,
    DecryptFailed,
    UnsupportedAlgorithm,
}

export class Exception<T extends ExceptionKinds> extends Error {
    public readonly kind: T
    // @ts-ignore
    constructor(readonly kind: T, reason: unknown) {
        if (typeof reason === 'string') super(reason)
        // @ts-expect-error error cause proposal
        else super(ExceptionKinds[kind], { cause: reason })
        this.kind = kind
    }
    static mapErr<E extends ExceptionKinds>(r: E) {
        return (e: unknown) => new Exception(r, e)
    }
    static withErr<P extends any[], T, E extends ExceptionKinds>(
        f: (...args: P) => Result<T, unknown>,
        o: E,
    ): (...args: P) => Result<T, Exception<E>>
    static withErr<P extends any[], T, E extends ExceptionKinds>(
        f: (...args: P) => Promise<Result<T, unknown>>,
        o: E,
    ): (...args: P) => Promise<Result<T, Exception<E>>>
    static withErr<P extends any[], T, E extends ExceptionKinds>(
        f: (...args: P) => Result<T, unknown> | Promise<Result<T, unknown>>,
        o: E,
    ): (...args: P) => Result<T, Exception<E>> | Promise<Result<T, Exception<E>>> {
        return (...args: P) => {
            const r = f(...args)
            if (r instanceof Promise) return r.then((r) => r.mapErr(Exception.mapErr(o)))
            return r.mapErr(Exception.mapErr(o))
        }
    }
    toErr() {
        return Err(this)
    }
}
