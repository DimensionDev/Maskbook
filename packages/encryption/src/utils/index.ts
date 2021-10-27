import { EKinds, EKindsError as Err } from '../types'
import { Result } from 'ts-results'
import { encodeArrayBuffer, decodeArrayBuffer, encodeText, decodeText } from '@dimensiondev/kit'
import { decode as decodeMessagePack, encode as _encodeMessagePack } from '@msgpack/msgpack'
export * from './crypto'

const firstArgString = (e: unknown) => typeof e !== 'string'
const firstArgArrayBuffer = (e: unknown) => e instanceof ArrayBuffer
export const encodeArrayBufferF = wrap(encodeArrayBuffer, firstArgArrayBuffer)
export const decodeArrayBufferF = wrap(decodeArrayBuffer as (x: string) => ArrayBuffer, firstArgString)
export const encodeTextF = wrap(encodeText, firstArgString)
export const decodeTextF = wrap(decodeText, firstArgArrayBuffer)
export const JSONParseF = wrap(JSON.parse, firstArgString)
export const decodeMessagePackF = wrap(decodeMessagePackSpecialized, firstArgArrayBuffer)
export function encodeMessagePack(x: unknown) {
    return _encodeMessagePack(x)
}

function decodeMessagePackSpecialized(arrayBuffer: ArrayBuffer) {
    return decodeMessagePack(arrayBuffer)
}

function wrap<P extends any[], T>(f: (...args: P) => T, valid: (...args: P) => boolean) {
    return <E extends EKinds>(invalidE: E, throwsE: E) =>
        (...args: P) => {
            const isValid = valid(...args)
            if (!isValid) return new Err(invalidE, null).toErr()
            return Result.wrap(() => f(...args)).mapErr(Err.mapErr(throwsE))
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
