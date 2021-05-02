import { isTypedMessageTuple, TypedMessageTuple } from '..'
import type {
    NonSerializableTypedMessage,
    NonSerializableWithToJSONTypedMessage,
    SerializableTypedMessage,
    SerializableTypedMessages,
    TypedMessage,
} from '../base'
import { eq } from 'lodash-es'

export function isSerializableTypedMessage(x: TypedMessage): x is SerializableTypedMessages {
    if ((<SerializableTypedMessage<number>>x).serializable) return true
    const y = <NonSerializableWithToJSONTypedMessage>x
    if (y.serializable === false && y.toJSON) return true
    return false
}

export function normalizeTypedMessage(x: SerializableTypedMessages): SerializableTypedMessages
export function normalizeTypedMessage(x: NonSerializableTypedMessage): NonSerializableTypedMessage
export function normalizeTypedMessage(x: TypedMessage): TypedMessage {
    return x
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
