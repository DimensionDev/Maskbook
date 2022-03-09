import type { SerializableTypedMessage, SerializableTypedMessages, TypedMessage, Meta } from '../base'
import { isSerializableTypedMessage } from '../utils'
import { composeEvery } from '../utils/internal'

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
