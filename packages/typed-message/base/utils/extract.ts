import type { TypedMessage } from '../base'
import { isTypedMessageText, isTypedMessageTuple, isTypedMessageImage } from '../core'
import { isTypedMessageAnchor } from '../extension'
import { Option, Some, None } from 'ts-results'

/**
 * Get inner text from a TypedMessage
 * @param message message
 */
export function extractTextFromTypedMessage(message: TypedMessage | null): Option<string> {
    if (!message) return None
    if (isTypedMessageText(message)) return Some(message.content)
    if (isTypedMessageAnchor(message)) return Some(message.content)
    if (isTypedMessageTuple(message)) {
        const str: string[] = []
        for (const item of message.items) {
            const text = extractTextFromTypedMessage(item)
            if (text.some) str.push(text.val)
        }
        if (str.length) return Some(str.join(' '))
        return None
    }
    return None
}
export function extractImageFromTypedMessage(
    message: TypedMessage | null,
    result: (string | Blob)[] = [],
): (string | Blob)[] {
    if (!message) return result
    if (isTypedMessageImage(message)) return result.concat(message.image)
    if (isTypedMessageTuple(message))
        return result.concat(message.items.flatMap((x) => extractImageFromTypedMessage(x)))
    return result
}
