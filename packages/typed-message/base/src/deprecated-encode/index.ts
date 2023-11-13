import { None, Ok, Result } from 'ts-results-es'
import { makeTypedMessageText, type TypedMessageText } from '../core/index.js'

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
    if (text.isErr()) return text

    if (version === -38) {
        const maybeMetadata = (() => {
            if (!text.value.includes('\u{1F9E9}')) return None
            const [maybeJSON] = text.value.split('\u{1F9E9}')
            return Result.wrap(() => JSON.parse(maybeJSON))
                .toOption()
                .map((val) => {
                    if (typeof val !== 'object' || Array.isArray(val)) return new Map()
                    return new Map(Object.entries(val))
                })
        })()
        return Ok(
            maybeMetadata.isSome() ?
                makeTypedMessageText(text.value.replace(/.+\u{1F9E9}/u, ''), maybeMetadata.value)
            :   makeTypedMessageText(text.value),
        )
    }
    return Ok(makeTypedMessageText(text.value))
}
