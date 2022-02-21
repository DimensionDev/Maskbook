import type { TypedMessage } from '../base'
import { isTypedMessageText, isTypedMessageImage } from '../core'
import { isTypedMessageAnchor } from '../extension'
import { Option, Some, None } from 'ts-results'
import { forEachTypedMessageChild } from '../visitor/forEachChild'

/**
 * Get inner text from a TypedMessage
 * @param message message
 */
export function extractTextFromTypedMessage(
    message: TypedMessage | null,
    options?: { linkAsText: boolean },
): Option<string> {
    if (!message) return None
    const text: string[] = []
    forEachTypedMessageChild(message, function visitor(message) {
        if (isTypedMessageText(message)) text.push(message.content)
        else if (isTypedMessageAnchor(message)) {
            text.push(message.content)
            if (options?.linkAsText) text.push(`(${message.href})`)
        } else forEachTypedMessageChild(message, visitor)
    })
    if (text.length) return Some(text.join(' '))
    return None
}
export function extractImageFromTypedMessage(message: TypedMessage | null): (string | Blob)[] {
    if (!message) return []
    const image: (string | Blob)[] = []
    forEachTypedMessageChild(message, function visitor(message) {
        if (isTypedMessageImage(message)) return image.push(message.image)
        return forEachTypedMessageChild(message, visitor)
    })
    return image
}
