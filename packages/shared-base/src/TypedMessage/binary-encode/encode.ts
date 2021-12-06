import {
    isTypedMessageText,
    isTypedMessageTupleSerializable,
    SerializableTypedMessages,
    TypedMessage,
    TypedMessageText,
    TypedMessageTupleSerializable,
} from '..'
import { encode } from '@msgpack/msgpack'
import { TypedMessageTypeEnum } from './type'

const HEAD = `[@masknet/shared-base] TypedMessage: `
export function encodeTypedMessageToDocument(tm: SerializableTypedMessages) {
    const doc = [0, encodeTypedMessage(tm)]
    return encode(doc)
}
function encodeTypedMessage(tm: SerializableTypedMessages): any[] {
    if (tm.serializable === false) {
        if (tm.alt) return encodeTypedMessage(tm.alt)
        throw new TypeError(`${HEAD}TypedMessage ${tm.type} does not support serialization.`)
    }
    if (isTypedMessageText(tm)) return encodeTypedMessageText(tm)
    if (isTypedMessageTupleSerializable(tm)) return encodeTypedMessageTuple(tm)
    throw new TypeError(`${HEAD}Unsupported TypedMessage ${tm.type} to be serialized.`)
}
function encodeTypedMessageText(tm: TypedMessageText): any[] {
    // TODO: TextFormat
    return [TypedMessageTypeEnum.Text, tm.version, encodeMeta(tm), tm.content]
}
function encodeTypedMessageTuple(tm: TypedMessageTupleSerializable): any[] {
    return [TypedMessageTypeEnum.Tuple, tm.version, encodeMeta(tm), tm.items.map(encodeTypedMessage)]
}

function encodeMeta(tm: TypedMessage) {
    if (!tm.meta) return null
    const record: Record<string, any> = { __proto__: null }
    for (const [key, val] of tm.meta) {
        if (typeof key !== 'string') continue
        if (typeof val === 'undefined') continue
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
        const type = typeof val
        if (val === undefined) {
            console.warn(`${HEAD}undefined converted to null.`)
            return null
        }
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

        const result: Record<string, any> = {}
        for (const key in val) {
            if (typeof key !== 'string') throw new TypeError(`${HEAD}Unsupported type symbol.`)
            const v = val[key]
            result[key] = collectValue(v)
        }
        return result
    } catch (err) {
        console.warn('[@masknet/shared-base] TypedMessage: When converting value', val, ', an error occurred', err)
        throw err
    }
}
