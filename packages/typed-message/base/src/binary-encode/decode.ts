import { decode } from '@msgpack/msgpack'
import { Result } from 'ts-results-es'
import type { TypedMessage } from '../base.js'
import { makeTypedMessageText, makeTypedMessageTuple, makeTypedMessageUnknown } from '../core/index.js'
import { TypedMessageBinaryEncodingTypeEnum } from './type.js'

const HEAD = '[@masknet/typed-message] '
export function decodeTypedMessageFromDocument(bin: Uint8Array) {
    return Result.wrap(() => {
        const doc = decode(bin)
        if (!Array.isArray(doc)) throw new Error(`${HEAD}Invalid document`)
        if (doc[0] === 0) return makeTypedMessageText(doc[1], decodeMetadata(doc[2]))
        const [docVer, ...message] = doc
        if (typeof docVer !== 'number') throw new Error(`${HEAD}Invalid document`)
        if (docVer !== 1) throw new Error(`${HEAD}Unknown document version`)
        const result = decodeTypedMessage(message)
        fixU8Array(result)
        return result
    })
}
function decodeTypedMessage(tm: readonly unknown[]): TypedMessage {
    const [type] = tm
    if (typeof type !== 'string' && typeof type !== 'number') throw new TypeError(`${HEAD}Invalid TypedMessage`)
    if (type === TypedMessageBinaryEncodingTypeEnum.Text) return decodeTypedMessageText(tm)
    if (type === TypedMessageBinaryEncodingTypeEnum.Tuple) return decodeTypedMessageTuple(tm)
    return makeTypedMessageUnknown(tm)
}
function decodeTypedMessageText([, version, meta, text, format]: readonly unknown[]) {
    assertNumber(version)
    assertString(text)
    return makeTypedMessageText(text, decodeMetadata(meta))
}
function decodeTypedMessageTuple([, version, meta, items]: readonly unknown[]) {
    assertNumber(version)
    if (!Array.isArray(items)) throw new TypeError(`${HEAD}Invalid TypedMessageTuple`)
    return makeTypedMessageTuple(items.map(decodeTypedMessage), decodeMetadata(meta))
}
function decodeMetadata(meta: unknown): ReadonlyMap<string, unknown> | undefined {
    if (meta === null) return undefined
    if (typeof meta !== 'object') throw new TypeError(`${HEAD}Invalid TypedMessage`)
    if (Object.getPrototypeOf(meta) !== Object.prototype) throw new TypeError(`${HEAD}Invalid TypedMessage`)
    return new Map(Object.entries(meta))
}

function assertNumber(x: unknown): asserts x is number {
    if (typeof x !== 'number') throw new TypeError(`${HEAD}Invalid TypedMessage`)
}
function assertString(x: unknown): asserts x is string {
    if (typeof x !== 'string') throw new TypeError(`${HEAD}Invalid TypedMessage`)
}
// Detach Uint8Array from it's underlying buffer
function fixU8Array(input: unknown) {
    // for Array and object
    if (typeof input !== 'object' || input === undefined || input === null) return
    for (const key of Object.keys(input)) {
        const value = Reflect.get(input, key)
        if (value instanceof Uint8Array) {
            Reflect.set(input, key, value.slice())
        } else {
            fixU8Array(value)
        }
    }
}
