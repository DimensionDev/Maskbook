import { Err, Result } from 'ts-results'

export class CheckedError<T> extends Error {
    constructor(private kind: T, private reason: any) {
        super(kind + '', { cause: reason })
    }
    override toString() {
        if (this.reason) return `${this.kind}\n${this.reason}`
        return super.toString()
    }
    static mapErr<E>(r: E) {
        return (e: unknown) => new CheckedError(r, e)
    }
    static withErr<P extends any[], T, E>(
        f: (...args: P) => Result<T, unknown>,
        o: E,
    ): (...args: P) => Result<T, CheckedError<E>>
    static withErr<P extends any[], T, E>(
        f: (...args: P) => Promise<Result<T, unknown>>,
        o: E,
    ): (...args: P) => Promise<Result<T, CheckedError<E>>>
    static withErr<P extends any[], T, E>(
        f: (...args: P) => Result<T, unknown> | Promise<Result<T, unknown>>,
        o: E,
    ): (...args: P) => Result<T, CheckedError<E>> | Promise<Result<T, CheckedError<E>>> {
        return (...args: P) => {
            const r = f(...args)
            if ('then' in r) return r.then((r) => r.mapErr(CheckedError.mapErr(o)))
            return r.mapErr(CheckedError.mapErr(o))
        }
    }
    toErr() {
        return Err(this)
    }
}
