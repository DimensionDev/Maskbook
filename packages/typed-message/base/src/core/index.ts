import * as empty from './empty.js'
import * as unknown from './unknown.js'
import * as tuple from './tuple.js'
import * as text from './text.js'
import * as image from './image.js'
import * as promise from './promise.js'

import type { TypedMessage } from '../base.js'
import { composeSome } from '../utils/internal.js'

export * from './empty.js'
export * from './text.js'
export * from './image.js'
export * from './tuple.js'
export * from './unknown.js'
export * from './promise.js'

export type CoreTypedMessages =
    | empty.TypedMessageEmpty
    | text.TypedMessageText
    | image.TypedMessageImage
    | tuple.TypedMessageTuple
    | tuple.TypedMessageTupleSerializable
    | unknown.TypedMessageUnknown
    | promise.TypedMessagePromise

export const isCoreTypedMessages = composeSome(
    empty.isTypedMessageEmpty,
    text.isTypedMessageText,
    image.isTypedMessageImage,
    tuple.isTypedMessageTuple,
    unknown.isTypedMessageUnknown,
    promise.isTypedMessagePromise,
) as (x: TypedMessage) => x is CoreTypedMessages
