import {
    isTypedMessageText,
    isTypedMessageTupleSerializable,
    type TypedMessageText,
    type TypedMessageTupleSerializable,
} from '../core/index.js'
import type { SerializableTypedMessages, TypedMessage } from '../base.js'
import { encode } from '@msgpack/msgpack'
import { TypedMessageBinaryEncodingTypeEnum } from './type.js'

const HEAD = '[@masknet/typed-message] '
export function encodeTypedMessageToDocument(tm: SerializableTypedMessages): Uint8Array<ArrayBuffer> {
    if (isTypedMessageText(tm)) return encode([0, tm.content, encodeMeta(tm)]) as Uint8Array<ArrayBuffer>
    const doc = [1, ...encodeTypedMessage(tm)]
    return encode(doc) as Uint8Array<ArrayBuffer>
}
function encodeTypedMessage(tm: SerializableTypedMessages): any[] {
    if (!tm.serializable) {
        // eslint-disable-next-line unicorn/no-useless-recursion
        if (tm.alt) return encodeTypedMessage(tm.alt)
        throw new TypeError(`${HEAD}TypedMessage ${tm.type} does not support serialization.`)
    }
    if (isTypedMessageText(tm)) return encodeTypedMessageText(tm)
    if (isTypedMessageTupleSerializable(tm)) return encodeTypedMessageTuple(tm)
    throw new TypeError(`${HEAD}Unsupported TypedMessage ${tm.type} to be serialized.`)
}
function encodeTypedMessageText(tm: TypedMessageText): any[] {
    // TODO: TextFormat
    return [TypedMessageBinaryEncodingTypeEnum.Text, tm.version, encodeMeta(tm), tm.content]
}
function encodeTypedMessageTuple(tm: TypedMessageTupleSerializable): any[] {
    return [TypedMessageBinaryEncodingTypeEnum.Tuple, tm.version, encodeMeta(tm), tm.items.map(encodeTypedMessage)]
}

function encodeMeta(tm: TypedMessage) {
    if (!tm.meta) return null
    const record: { [property: string]: any } = { __proto__: null }
    for (const [key, val] of tm.meta) {
        if (typeof key !== 'string') continue
        if (val === undefined) continue
        try {
            record[key] = collectValue(val)
        } catch (err) {
            console.warn(`${HEAD}key ${key} is dropped due to the error`, err)
        }
    }
    return record
}
function collectValue(val: any): any {
    try {
        if (val === undefined) {
            console.warn(`${HEAD}undefined converted to null.`)
            return null
        }
        const type = typeof val
        if (type === 'number' || val === null || type === 'boolean' || type === 'string') return val

        if (type === 'bigint' || type === 'function' || type === 'symbol') {
            throw new TypeError(`${HEAD}Unsupported type ${type}`)
        }

        if (val instanceof Uint8Array) return new Uint8Array(val)
        if (val instanceof ArrayBuffer) {
            throw new TypeError(`${HEAD}ArrayBuffer must be Uint8Array.`)
        }

        if (Array.isArray(val)) return Array.from(val).map(collectValue)

        const proto = Object.getPrototypeOf(val)
        if (proto !== Object.prototype && proto !== null) {
            throw new TypeError(`${HEAD}unsupported value with a non trivial prototype.`)
        }

        const result: { [property: string]: any } = {}
        for (const [key, value] of Object.entries(val)) {
            result[key] = collectValue(value)
        }
        return result
    } catch (err) {
        console.warn(HEAD, 'When converting value', val, ', an error occurred', err)
        throw err
    }
}
