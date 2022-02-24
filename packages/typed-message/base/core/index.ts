export * from './empty'
export * from './text'
export * from './image'
export * from './tuple'
export * from './unknown'
export * from './promise'

import * as empty from './empty'
import * as unknown from './unknown'
import * as tuple from './tuple'
import * as text from './text'
import * as image from './image'
import * as promise from './promise'

import type { TypedMessage } from '../base'
import { composeSome } from '../utils/internal'

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
