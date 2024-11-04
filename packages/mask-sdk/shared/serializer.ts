import { JSONEncoder } from 'async-call-rpc/base.min'
import type { IsomorphicEncoder } from 'async-call-rpc/base.min'
import { MaskEthereumProviderRpcError } from './error.js'

const replacer = (key: string, value: unknown): unknown => {
    if (value === undefined) return { $type: 'undefined' }
    if (value instanceof ArrayBuffer) return ArrayBufferEncode(value)
    if (value instanceof Uint8Array) return U8ArrayEncode(value)
    if (value instanceof Map) return MapEncode(value)
    if (value instanceof MaskEthereumProviderRpcError) return MaskEthereumProviderRpcErrorEncode(value)
    return value
}
const reviver = (key: string, value: any): unknown => {
    if (typeof value === 'object' && value !== null && '$type' in value) {
        if (value.$type === 'undefined') return undefined
        return (
            ArrayBufferDecode(value) ||
            U8ArrayDecode(value) ||
            MapDecode(value) ||
            MaskEthereumProviderRpcErrorDecode(value)
        )
    }
    return value
}
export const encoder: IsomorphicEncoder = JSONEncoder({
    replacer,
    reviver,
})

const [ArrayBufferEncode, ArrayBufferDecode] = createClassSerializer(
    ArrayBuffer,
    (e) => [...new Uint8Array(e)],
    (e) => new Uint8Array(e).buffer,
)
const [U8ArrayEncode, U8ArrayDecode] = createClassSerializer<Uint8Array, number[]>(
    Uint8Array,
    (e) => [...e],
    (e) => new Uint8Array(e),
)
const [MapEncode, MapDecode] = createClassSerializer(
    Map,
    (e) => [...e.entries()].map((value) => [replacer('', value[0]), replacer('', value[1])]),
    (e) => new Map(e.map(([k, v]) => [reviver('', k), reviver('', v)])),
)
const [MaskEthereumProviderRpcErrorEncode, MaskEthereumProviderRpcErrorDecode] = createClassSerializer(
    MaskEthereumProviderRpcError,
    (e) => [replacer('', e.cause), Number(e.code), replacer('', e.data), String(e.message)],
    ([cause, code, data, message]) => {
        return new MaskEthereumProviderRpcError(Number(code), String(message), {
            cause: reviver('', cause),
            data: reviver('', data),
        })
    },
)
function createClassSerializer<T, Q>(
    clz: { new (...args: any): T; name: string },
    encode: (a: T) => Q,
    decode: (a: Q) => T,
) {
    return [
        (v: T) => {
            return { $type: clz.name, value: encode(v) }
        },
        (v: { $type: string; value: Q }) => {
            if (v.$type === clz.name) return decode(v.value)
            return undefined
        },
    ] as const
}
