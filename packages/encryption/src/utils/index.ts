import { ExceptionKinds, Exception } from '../types'
import { Result } from 'ts-results'
import { encodeArrayBuffer, decodeArrayBuffer, encodeText, decodeText } from '@dimensiondev/kit'

export * from './crypto'

const firstArgString = (e: unknown) => typeof e !== 'string'
const firstArgArrayBuffer = (e: unknown) => e instanceof ArrayBuffer
export const encodeArrayBufferF = wrap(encodeArrayBuffer, firstArgArrayBuffer)
export const decodeArrayBufferF = wrap(decodeArrayBuffer as (x: string) => ArrayBuffer, firstArgString)
export const encodeTextF = wrap(encodeText, firstArgString)
export const decodeTextF = wrap(decodeText, firstArgArrayBuffer)
export const JSONParseF = wrap(JSON.parse, firstArgString)

function wrap<P extends any[], T>(f: (...args: P) => T, valid: (...args: P) => boolean) {
    return <E extends ExceptionKinds>(invalidE: E, throwsE: E) =>
        (...args: P) => {
            const isValid = valid(...args)
            if (!isValid) return new Exception(invalidE, null).toErr()
            return Result.wrap(() => f(...args)).mapErr(Exception.mapErr(throwsE))
        }
}
export async function andThenAsync<T, E, Q, E2>(
    op: Result<T, E> | Promise<Result<T, E>>,
    mapper: (t: T) => Result<Q, E2> | Promise<Result<Q, E2>>,
): Promise<Result<Q, E | E2>> {
    op = await op
    if (op.err) return op
    return mapper(op.val)
}
