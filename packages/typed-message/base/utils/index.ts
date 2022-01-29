export * from './metadata'
export * from './extract'
export * from './promise'

import type {
    TypedMessage,
    SerializableTypedMessages,
    SerializableTypedMessage,
    NonSerializableWithAltTypedMessage,
} from '../base'
import { isTypedMessageTuple, TypedMessageTuple } from '../core'
import { eq } from 'lodash-unified'

export function isNonSerializableTypedMessageWithAlt(x: TypedMessage): x is NonSerializableWithAltTypedMessage {
    const y = x as NonSerializableWithAltTypedMessage
    if (y.serializable !== false) return false
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
    if (isTypedMessageTuple(message1)) {
        const msg1 = message1 as TypedMessageTuple
        const msg2 = message2 as TypedMessageTuple
        if (msg1.items.length !== msg2.items.length) return false
        return msg1.items.every((item, index) => isTypedMessageEqual(item, msg2.items[index]))
    }
    return eq(message1, message2)
}
