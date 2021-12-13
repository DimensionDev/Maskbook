import { isTypedMessageAnchor, isTypedMessageText, TypedMessage } from '@masknet/shared-base'

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
} from '@masknet/shared-base'
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
} from '@masknet/shared-base'
export function getTypedMessageContent(message: TypedMessage): string {
    if (isTypedMessageText(message)) return message.content
    if (isTypedMessageAnchor(message)) return message.href
    return ''
}
