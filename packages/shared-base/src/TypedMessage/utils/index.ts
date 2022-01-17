import { isTypedMessageAnchor } from '../extension'
import { isTypedMessageText, isTypedMessageTuple, TypedMessageTuple } from '../core'
import type {
    NonSerializableWithAltTypedMessage,
    SerializableTypedMessage,
    SerializableTypedMessages,
    TypedMessage,
} from '../base'
import { eq } from 'lodash-unified'
import { Option, Some, None } from 'ts-results'
import { isTypedMessageImage } from '..'

export function isSerializableTypedMessage(x: TypedMessage): x is SerializableTypedMessages {
    if ((x as SerializableTypedMessage<number>).serializable) return true
    const y = x as NonSerializableWithAltTypedMessage
    if (y.serializable === false && y.alt) return true
    return false
}

/**
 * This is a tree compare algorithm, may need to find a more efficient one from NPM
 */
export function isTypedMessageEqual(message1: TypedMessage, message2: TypedMessage): boolean {
    if (message1.type !== message2.type) return false
    if (message1.meta !== message2.meta) return false
    if (isTypedMessageTuple(message1)) {
        const msg1 = message1 as TypedMessageTuple
        const msg2 = message2 as TypedMessageTuple
        if (msg1.items.length !== msg2.items.length) return false
        return msg1.items.every((item, index) => isTypedMessageEqual(item, msg2.items[index]))
    }
    return eq(message1, message2)
}

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
export * from '../transforms/flatten'
export * from '../transforms/promise'
