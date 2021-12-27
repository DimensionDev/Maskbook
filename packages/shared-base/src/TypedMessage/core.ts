import type {
    SerializableTypedMessage,
    SerializableTypedMessages,
    NonSerializableTypedMessage,
    TypedMessage,
} from './base'
import { isSerializableTypedMessage } from './utils'
import { composeEvery, composeSome, createIsType } from './utils/internal'
// Don't forget to add to isWellKnownCoreTypedMessages also
type Meta = TypedMessage['meta']
export type WellKnownCoreTypedMessages =
    | TypedMessageText
    | TypedMessageImage
    | TypedMessageTuple
    | TypedMessageTupleSerializable
    | TypedMessageUnknown
    | TypedMessageEmpty
    | TypedMessagePromise
//#region Text
export type TypedMessageText = TypedMessageTextV1
/** A text message */
export interface TypedMessageTextV1 extends SerializableTypedMessage<1> {
    readonly type: 'text'
    readonly content: string
}
export const isTypedMessageTextV1 = createIsType<TypedMessageTextV1>('text', 1)
export const isTypedMessageText = composeSome(isTypedMessageTextV1) as (x: TypedMessage) => x is TypedMessageText
export function makeTypedMessageText(text: string, meta?: Meta): TypedMessageTextV1 {
    return { type: 'text', version: 1, serializable: true, content: text, meta }
}
//#endregion
//#region Image
export type TypedMessageImage = TypedMessageImageV1
/**
 * A single image
 * TODO: it should be serializable but still not decided how to do that yet.
 */
export interface TypedMessageImageV1 extends NonSerializableTypedMessage {
    readonly type: 'image'
    readonly image: string | Blob
    readonly width?: number
    readonly height?: number
}
export const isTypedMessageImageV1 = createIsType<TypedMessageImageV1>('image', 1)
export const isTypedMessageImage = composeSome(isTypedMessageImageV1) as (x: TypedMessage) => x is TypedMessageImage
export function makeTypedMessageImage(
    image: TypedMessageImageV1['image'],
    size?: { width: number; height: number },
    meta?: Meta,
): TypedMessageImageV1 {
    return { type: 'image', serializable: false, image, width: size?.width, height: size?.height, meta }
}
//#endregion
//#region Tuple

/** Multiple TypedMessages (ordered) */
export interface TypedMessageTuple<T extends readonly TypedMessage[] = readonly TypedMessage[]> extends TypedMessage {
    readonly type: 'tuple'
    readonly items: T
}
export interface TypedMessageTupleSerializable<
    T extends readonly SerializableTypedMessages[] = readonly SerializableTypedMessages[],
> extends SerializableTypedMessage<1>,
        TypedMessageTuple<T> {
    readonly type: 'tuple'
}
export const isTypedMessageTuple = (x: TypedMessage): x is TypedMessageTuple | TypedMessageTupleSerializable =>
    x.type === 'tuple'
export const isTypedMessageTupleSerializable: (x: TypedMessage) => x is TypedMessageTupleSerializable = composeEvery(
    isTypedMessageTuple,
    isSerializableTypedMessage,
) as any
export function makeTypedMessageTuple<T extends readonly TypedMessage[] = readonly TypedMessage[]>(
    items: T,
    meta?: Meta,
): TypedMessageTuple<T> {
    return { type: 'tuple', items, meta }
}
export function makeTypedMessageTupleFromList<T extends readonly TypedMessage[] = readonly TypedMessage[]>(
    ...args: T
): TypedMessageTuple<T> {
    return { type: 'tuple', items: args }
}
export function makeTypedMessageTupleSerializable<
    T extends readonly SerializableTypedMessages[] = readonly SerializableTypedMessages[],
>(items: T, meta?: Meta): TypedMessageTupleSerializable<T> {
    return { type: 'tuple', version: 1, serializable: true, items, meta }
}
export function makeTypedMessageSerializableTupleFromList<
    T extends readonly SerializableTypedMessages[] = readonly SerializableTypedMessages[],
>(...args: T): TypedMessageTupleSerializable<T> {
    return { type: 'tuple', version: 1, items: args, serializable: true }
}
//#endregion
//#region unknown and empty
export interface TypedMessageUnknown extends NonSerializableTypedMessage {
    readonly type: 'unknown'
    /** The unrecognized data */
    readonly raw?: unknown
}
export const isTypedMessageUnknown = createIsType<TypedMessageUnknown>('unknown')
export function makeTypedMessageUnknown(raw?: unknown, meta?: Meta): TypedMessageUnknown {
    return { type: 'unknown', serializable: false, meta, raw }
}

export interface TypedMessageEmpty extends SerializableTypedMessage<1> {
    readonly type: 'empty'
}
export const isTypedMessageEmpty = createIsType<TypedMessageEmpty>('empty')
export function makeTypedMessageEmpty(meta?: Meta): TypedMessageEmpty {
    return { type: 'empty', serializable: true, version: 1, meta }
}
//#endregion
//#region Promise
export interface TypedMessagePromise<T extends TypedMessage = TypedMessage> extends NonSerializableTypedMessage {
    readonly type: 'promise'
    readonly promise: Promise<T>
}
export const isTypedMessagePromise = createIsType<TypedMessagePromise>('promise')
export function makeTypedMessagePromise<T extends TypedMessage = TypedMessage>(
    promise: Promise<T>,
    meta?: Meta,
): TypedMessagePromise<T> {
    return { type: 'promise', serializable: false, promise, meta }
}
//#endregion
export const isWellKnownCoreTypedMessages = composeSome(
    isTypedMessageText,
    isTypedMessageImage,
    isTypedMessageTuple,
    isTypedMessageUnknown,
    isTypedMessagePromise,
) as (x: TypedMessage) => x is WellKnownCoreTypedMessages
