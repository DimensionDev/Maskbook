import { CheckedError } from '@masknet/shared-base'
import { Result } from 'ts-results'
import { decodeArrayBuffer, decodeText } from '@dimensiondev/kit'
import { decode as decodeMessagePack, encode } from '@msgpack/msgpack'
export * from './crypto'

const firstArgString = (e: unknown) => typeof e === 'string'
const firstArgUint8Array = (e: unknown) => e instanceof Uint8Array
export const decodeUint8ArrayF = wrap((x: string) => new Uint8Array(decodeArrayBuffer(x)), firstArgString)
export const decodeTextF = wrap(decodeText, firstArgUint8Array)
export const JSONParseF = wrap(JSON.parse, firstArgString)
export const decodeMessagePackF = wrap((u8: Uint8Array) => decodeMessagePack(u8), firstArgUint8Array)

export function encodeMessagePack(data: any) {
    // The returned buffer is a slice of a larger ArrayBuffer
    return encode(data).slice()
}

function wrap<P extends any[], T>(f: (...args: P) => T, valid: (...args: P) => boolean) {
    return <E>(invalidE: E, throwsE: E) =>
        (...args: P) => {
            const isValid = valid(...args)
            if (!isValid) return new CheckedError(invalidE, null).toErr()
            return Result.wrap(() => f(...args)).mapErr(CheckedError.mapErr(throwsE))
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
