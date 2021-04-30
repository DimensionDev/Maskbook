import { isTypedMessageAnchor, isTypedMessageText, TypedMessage } from '@dimensiondev/maskbook-shared'

export type {
    TypedMessage,
    TypedMessageText,
    TypedMessageAnchor,
    TypedMessageImage,
    TypedMessageUnknown,
    TypedMessageTuple,
    TypedMessagePromise,
    TypedMessageEmpty,
    TypedMessageImageV1,
    TypedMessageTextV1,
    TypedMessageTupleSerializable,
} from '@dimensiondev/maskbook-shared'
export {
    isTypedMessageText,
    isTypedMessageAnchor,
    isTypedMessageImage,
    isTypedMessageTuple,
    isTypedMessageUnknown,
    isTypedMessagePromise,
    isTypedMessageEmpty,
    isTypedMessageImageV1,
    isTypedMessageTextV1,
    isTypedMessageTupleSerializable,
    isWellKnownTypedMessages,
    isSerializableTypedMessage,
    isWellKnownCoreTypedMessages,
    makeTypedMessageAnchor,
    makeTypedMessageImage,
    makeTypedMessageSerializableTupleFromList,
    makeTypedMessageText,
    makeTypedMessageTuple,
    makeTypedMessageTupleFromList,
    makeTypedMessageTupleSerializable,
    makeTypedMessageUnknown,
    makeTypedMessageEmpty,
    makeTypedMessagePromise,
} from '@dimensiondev/maskbook-shared'
export function getTypedMessageContent(message: TypedMessage): string {
    if (isTypedMessageText(message)) return message.content
    if (isTypedMessageAnchor(message)) return message.href
    return ''
}
