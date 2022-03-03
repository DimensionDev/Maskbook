export * from './extract'
export * from './metadata'

import type {
    NonSerializableWithAltTypedMessage,
    SerializableTypedMessage,
    SerializableTypedMessages,
    TypedMessage,
} from '../base'
import { isTypedMessageText, isTypedMessageTuple } from '../core'
import { isTypedMessageAnchor, isTypedMessageMaskPayload } from '../extension'
import { forEachTypedMessageChild } from '../visitor'

export function isNonSerializableTypedMessageWithAlt(x: TypedMessage): x is NonSerializableWithAltTypedMessage {
    const y = x as NonSerializableWithAltTypedMessage
    if (y.serializable !== false) return false
    if (!y.alt) return false
    return isSerializableTypedMessage(y.alt)
}
export function isSerializableTypedMessage(x: TypedMessage): x is SerializableTypedMessages {
    if ((x as SerializableTypedMessage<number>).serializable) return true
    return isNonSerializableTypedMessageWithAlt(x)
}

/**
 * This is a tree compare algorithm, may need to find a more efficient one from NPM
 */
export function isTypedMessageEqual(message1: TypedMessage, message2: TypedMessage): boolean {
    if (message1.type !== message2.type) return false
    if (message1.meta !== message2.meta) return false
    return renderMessage(message1) === renderMessage(message2)
}

// TODO unit tests
function renderMessage(message: TypedMessage) {
    const fragments: string[] = []
    forEachTypedMessageChild(message, function visitor(node) {
        if (isTypedMessageTuple(node)) {
            visitor(node)
        } else if (isTypedMessageMaskPayload(node)) {
            fragments.push(renderMessage(node))
        } else if (isTypedMessageText(node)) {
            fragments.push(node.content)
        } else if (isTypedMessageAnchor(node)) {
            fragments.push(node.content)
        }
    })
    return fragments.join('')
}
