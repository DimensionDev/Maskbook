import { JSONSerialization } from 'async-call-rpc/base.min'
import type { Serialization } from 'async-call-rpc/base.min'
import { MaskEthereumProviderRpcError } from './error.js'
export type { Serialization } from 'async-call-rpc/base.min'
export const serializer: Serialization = JSONSerialization(
    [
        (key, value) => {
            if (value instanceof ArrayBuffer) return ArrayBufferEncode(value)
            if (value instanceof Uint8Array) return U8ArrayEncode(value)
            if (value instanceof Map) return MapEncode(value)
            if (value instanceof MaskEthereumProviderRpcError) return MaskEthereumProviderRpcErrorEncode(value)
            return value
        },
        (key, value) => {
            if (typeof value === 'object' && value !== null && '$type' in value) {
                return (
                    ArrayBufferDecode(value) ||
                    U8ArrayDecode(value) ||
                    MapDecode(value) ||
                    MaskEthereumProviderRpcErrorDecode(value)
                )
            }
            return value
        },
    ],
    undefined,
    'keep',
)
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
    (e) => [...e.entries()],
    (e) => new Map(e),
)
const [MaskEthereumProviderRpcErrorEncode, MaskEthereumProviderRpcErrorDecode] = createClassSerializer(
    MaskEthereumProviderRpcError,
    (e) => [e.cause, e.code, e.data, e.message] as const,
    ([cause, code, data, message]) => {
        const e = new MaskEthereumProviderRpcError({ cause, code, message, data })
        Object.assign(e, { code, data, stack: '' })
        return e
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
