import { None, Ok, Result } from 'ts-results-es'
import { makeTypedMessageText, type TypedMessageText } from '../core/index.js'

export function encodeTypedMessageV38Format(message: TypedMessageText): Uint8Array<ArrayBuffer> {
    const encoder = new TextEncoder()
    if (message.meta?.size) {
        const rec = Object.fromEntries(message.meta)
        return encoder.encode(`${JSON.stringify(rec)}\u{1F9E9}${message.content}`)
    }
    return encoder.encode(message.content)
}
export function decodeTypedMessageV38ToV40Format(raw: Uint8Array, version: -38 | -39 | -40) {
    const decoder = new TextDecoder()
    const text = Result.wrap(() => decoder.decode(raw))
    if (text.isErr()) return text

    if (version === -38) {
        const separator = '\u{1F9E9}'
        const maybeMetadata = (() => {
            if (!text.value.includes(separator)) return None
            const [maybeJSON] = text.value.split(separator)
            return Result.wrap(() => JSON.parse(maybeJSON))
                .toOption()
                .map((val): Map<string, unknown> | undefined => {
                    if (typeof val !== 'object' || val === null || Array.isArray(val)) return undefined
                    return new Map(Object.entries(val))
                })
        })()
        if (maybeMetadata.isNone() || maybeMetadata.value === undefined) return Ok(makeTypedMessageText(text.value))
        // Encode inserts exactly one separator after the metadata; only the first
        // one separates metadata from content, the content may contain more.
        const [, ...contentParts] = text.value.split(separator)
        return Ok(makeTypedMessageText(contentParts.join(separator), maybeMetadata.value))
    }
    return Ok(makeTypedMessageText(text.value))
}
