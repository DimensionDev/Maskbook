import { decode } from '@msgpack/msgpack'
import { Result } from 'ts-results'
import { makeTypedMessageText, makeTypedMessageTuple, makeTypedMessageUnknown, TypedMessage } from '..'
import { TypedMessageTypeEnum } from './type'

const HEAD = `[@masknet/shared-base] TypedMessage: `
export function decodeTypedMessageFromDocument(bin: Uint8Array) {
    return Result.wrap(() => {
        const doc = decode(bin)
        if (!Array.isArray(doc)) throw new Error(`${HEAD}Invalid document`)
        const [docVer, message] = doc
        if (typeof docVer !== 'number') throw new Error(`${HEAD}Invalid document`)
        if (docVer !== 0) throw new Error(`${HEAD}Unknown document version`)
        const result = decodeTypedMessage(message)
        fixU8Array(result)
        return result
    })
}
function decodeTypedMessage(tm: readonly unknown[]): TypedMessage {
    const [type] = tm
    if (typeof type !== 'string' && typeof type !== 'number') throw new TypeError(`${HEAD}Invalid TypedMessage`)
    if (type === TypedMessageTypeEnum.Text) return decodeTypedMessageText(tm)
    if (type === TypedMessageTypeEnum.Tuple) return decodeTypedMessageTuple(tm)
    return makeTypedMessageUnknown(tm, decodeMetadata(tm[1]))
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
    return meta as any
}

function assertNumber(x: unknown): asserts x is number {
    if (typeof x !== 'number') throw new TypeError(`${HEAD}Invalid TypedMessage`)
}
function assertString(x: unknown): asserts x is string {
    if (typeof x !== 'string') throw new TypeError(`${HEAD}Invalid TypedMessage`)
}
// Detach Uint8Array from it's underlying buffer
function fixU8Array(obj: unknown) {
    // for Array and object
    if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
            const val = (obj as any)[key]
            if (val instanceof Uint8Array) (obj as any)[key] = val.slice()
            else fixU8Array(val)
        }
    }
}
