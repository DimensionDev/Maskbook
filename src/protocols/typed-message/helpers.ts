import {
    TypedMessage,
    isTypedMessageText,
    isTypedMessageCompound,
    TypedMessageCompound,
    isTypedMessgaeAnchor,
} from './types'
import { Result, Ok, Err } from 'ts-results'
import { eq } from 'lodash-es'
/**
 * Get inner text from a TypedMessage
 * @param message message
 */
export function extractTextFromTypedMessage(message: TypedMessage | null): Result<string, void> {
    if (message === null) return Err.EMPTY
    if (isTypedMessageText(message)) return Ok(message.content)
    if (isTypedMessageCompound(message)) {
        const str: string[] = []
        for (const item of message.items) {
            const text = extractTextFromTypedMessage(item)
            if (text.ok) str.push(text.val)
        }
        if (str.length) return Ok(str.join(' '))
        return Err.EMPTY
    }
    return Err.EMPTY
}

/**
 * This is a tree diff algorithm, may need to find a more efficient one from NPM
 */
export function isTypedMessageEqual(message1: TypedMessage, message2: TypedMessage): boolean {
    if (message1.type !== message2.type) return false
    if (message1.meta !== message2.meta) return false
    if (message1.version !== message1.version) return false
    switch (message1.type) {
        case 'compound': {
            const msg1 = message1 as TypedMessageCompound
            const msg2 = message2 as TypedMessageCompound
            if (msg1.items.length !== msg2.items.length) return false
            return msg1.items.every((item, index) => isTypedMessageEqual(item, msg2.items[index]))
        }
        case 'image':
        case 'text':
        case 'anchor':
        case 'unknown':
        case 'empty':
        case 'suspended':
        default:
            return eq(message1, message2)
    }
}

/**
 * Serialize typed message
 */
export function serializeTypedMessage(message: TypedMessage | null) {
    if (!message) return ''
    if (isTypedMessageText(message)) return message.content
    if (isTypedMessgaeAnchor(message)) return message.content
    return ''
}
