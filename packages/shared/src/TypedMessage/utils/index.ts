import type {
    NonSerializableTypedMessage,
    NonSerializableWithToJSONTypedMessage,
    SerializableTypedMessage,
    SerializableTypedMessages,
    TypedMessage,
} from '../base'

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
