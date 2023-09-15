import { JSONSerialization } from 'async-call-rpc/base.min'
import type { Serialization } from 'async-call-rpc/base.min'
import { MaskEthereumProviderRpcError } from './error.js'
export type { Serialization } from 'async-call-rpc/base.min'
export const serializer: Serialization = JSONSerialization([
    (key, value) => {
        if (value === undefined) return { $type: 'undefined' }
        if (value instanceof ArrayBuffer) return ArrayBufferEncode(value)
        if (value instanceof Uint8Array) return U8ArrayEncode(value)
        if (value instanceof Map) return MapEncode(value)
        if (value instanceof MaskEthereumProviderRpcError) return MaskEthereumProviderRpcErrorEncode(value)
        return value
    },
    (key, value) => {
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
    },
])

const [ArrayBufferEncode, ArrayBufferDecode] = createClassSerializer(
    ArrayBuffer,
    (e) => [...new Uint8Array(e)],
    (e) => new Uint8Array(e).buffer,
)
const [U8ArrayEncode, U8ArrayDecode] = createClassSerializer(
    Uint8Array,
    (e) => [...e],
    (e) => new Uint8Array(e),
)
const [MapEncode, MapDecode] = createClassSerializer(
    Map,
    (e) => [...e.entries()].map((value) => [serializer.serialization(value[0]), serializer.serialization(value[1])]),
    (e) => new Map(e.map(([k, v]) => [serializer.deserialization(k), serializer.deserialization(v)])),
)
const [MaskEthereumProviderRpcErrorEncode, MaskEthereumProviderRpcErrorDecode] = createClassSerializer(
    MaskEthereumProviderRpcError,
    (e) => [serializer.serialization(e.cause), Number(e.code), serializer.serialization(e.data), String(e.message)],
    ([cause, code, data, message]) => {
        return new MaskEthereumProviderRpcError(Number(code), String(message), {
            cause: serializer.deserialization(cause),
            // data: serializer.deserialization(data),
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
