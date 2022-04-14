import { None, Ok, Result } from 'ts-results'
import { makeTypedMessageText, TypedMessageText } from '../core/index.js'

export function encodeTypedMessageV38Format(message: TypedMessageText) {
    const encoder = new TextEncoder()
    if (message.meta?.size) {
        const rec = Object.fromEntries(message.meta.entries())
        return encoder.encode(`${JSON.stringify(rec)}\u{1F9E9}${message.content}`)
    }
    return encoder.encode(message.content)
}
export function decodeTypedMessageV38ToV40Format(raw: Uint8Array, version: -38 | -39 | -40) {
    const decoder = new TextDecoder()
    const text = Result.wrap(() => decoder.decode(raw))
    const { val, err } = text
    if (err) return text

    if (version === -38) {
        const maybeMetadata = (() => {
            if (!val.includes('\u{1F9E9}')) return None
            const [maybeJSON] = val.split('\u{1F9E9}')
            return Result.wrap(() => JSON.parse(maybeJSON))
                .toOption()
                .map((val) => {
                    if (typeof val !== 'object' || Array.isArray(val)) return new Map()
                    return new Map(Object.entries(val))
                })
        })()
        return Ok(
            maybeMetadata.some
                ? makeTypedMessageText(val.replace(/.+\u{1F9E9}/u, ''), maybeMetadata.val)
                : makeTypedMessageText(val),
        )
    }
    return Ok(makeTypedMessageText(val))
}
