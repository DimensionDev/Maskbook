import { isCoreTypedMessages, type CoreTypedMessages } from './core/index.js'
import { isWellKnownExtensionTypedMessages, type WellKnownExtensionTypedMessages } from './extension/index.js'
import { composeSome } from './utils/internal.js'

export type {
    Meta,
    TypedMessage,
    NonSerializableTypedMessage,
    NonSerializableWithAltTypedMessage,
    SerializableTypedMessage,
    SerializableTypedMessages,
} from './base.js'
export {
    // core
    type CoreTypedMessages,
    isCoreTypedMessages,
    // empty
    type TypedMessageEmpty,
    isTypedMessageEmpty,
    makeTypedMessageEmpty,
    // image
    type TypedMessageImage,
    isTypedMessageImage,
    makeTypedMessageImage,
    // promise
    type TypedMessagePromise,
    type PendingPromise,
    type FulfilledPromise,
    type RejectedPromise,
    type StatusExposedPromise,
    isTypedMessagePromise,
    makeTypedMessagePromise,
    // text
    type TypedMessageText,
    type TypedMessageTextV1,
    isTypedMessageText,
    isTypedMessageTextV1,
    makeTypedMessageText,
    // tuple
    type TypedMessageTuple,
    type TypedMessageTupleSerializable,
    isTypedMessageTuple,
    isTypedMessageTupleSerializable,
    makeTypedMessageTuple,
    makeTypedMessageSerializableTupleFromList,
    makeTypedMessageTupleFromList,
    makeTypedMessageTupleSerializable,
    // unknown
    type TypedMessageUnknown,
    isTypedMessageUnknown,
    makeTypedMessageUnknown,
} from './core/index.js'
export {
    type WellKnownExtensionTypedMessages,
    isWellKnownExtensionTypedMessages,
    // links
    type TypedMessageAnchor,
    isTypedMessageAnchor,
    makeTypedMessageAnchor,
    // mask payload
    type TypedMessageMaskPayload,
    isTypedMessageMaskPayload,
    makeTypedMessageMaskPayload,
    unstable_STYLE_META,
} from './extension/index.js'
export { decodeTypedMessageFromDocument, encodeTypedMessageToDocument } from './binary-encode/index.js'
export {
    decodeTypedMessageV38ToV40Format as decodeTypedMessageFromDeprecatedFormat,
    encodeTypedMessageV38Format as encodeTypedMessageToDeprecatedFormat,
} from './deprecated-encode/index.js'
export {
    extractImageFromTypedMessage,
    extractTextFromTypedMessage,
    isNonSerializableTypedMessageWithAlt,
    isSerializableTypedMessage,
    isTypedMessageEqual,
} from './utils/index.js'
export { forEachTypedMessageChild, visitEachTypedMessageChild } from './visitor/index.js'
export {
    type Transformer,
    type TransformationContext,
    type ComposedTransformers,
    emptyTransformationContext,
    createTransformationContext,
    composeTransformers,
    FlattenTypedMessage,
    ParseLinkTransformer,
    // Not ready yet.
    // createMaskPayloadTransform,
} from './transformer/index.js'

export type WellKnownTypedMessages = WellKnownExtensionTypedMessages | CoreTypedMessages
export const isWellKnownTypedMessages = composeSome(isCoreTypedMessages, isWellKnownExtensionTypedMessages)
