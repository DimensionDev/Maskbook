import type {
    TypedMessage,
    SerializableTypedMessages,
    SerializableTypedMessage,
    NonSerializableWithAltTypedMessage,
} from '../base.js'
import { isEqual } from 'lodash-es'

export * from './extract.js'

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
    // perform a deep equal
    return isEqual(message1, message2)
}
