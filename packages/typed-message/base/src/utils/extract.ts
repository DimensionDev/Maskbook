import type { TypedMessage } from '../base.js'
import { isTypedMessageText, isTypedMessageImage } from '../core/index.js'
import { isTypedMessageAnchor } from '../extension/index.js'
import { type Option, Some, None } from 'ts-results-es'
import { forEachTypedMessageChild } from '../visitor/index.js'

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
    function visitor(message: TypedMessage) {
        if (isTypedMessageText(message)) text.push(message.content)
        else if (isTypedMessageAnchor(message)) {
            text.push(message.content)
            if (options?.linkAsText) text.push(`(${message.href})`)
        } else forEachTypedMessageChild(message, visitor)
    }
    visitor(message)
    forEachTypedMessageChild(message, visitor)
    if (text.length) return Some(text.join(' '))
    return None
}
export function extractImageFromTypedMessage(message: TypedMessage | null): Array<string | Blob> {
    if (!message) return []

    const image: Array<string | Blob> = []
    function visitor(message: TypedMessage): void {
        if (isTypedMessageImage(message)) return void image.push(message.image)
        return forEachTypedMessageChild(message, visitor)
    }
    visitor(message)
    forEachTypedMessageChild(message, visitor)
    return image
}
