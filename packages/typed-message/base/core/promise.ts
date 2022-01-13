import type { TypedMessage, NonSerializableTypedMessage } from '../base'
import { createIsType } from '../utils/internal'

export interface TypedMessagePromise<T extends TypedMessage = TypedMessage> extends NonSerializableTypedMessage {
    readonly type: 'promise'
    readonly promise: Promise<T>
    readonly value?: T
    readonly meta?: undefined
    /** What to display when the message is not ready. */
    readonly alt?: TypedMessage
}

export const isTypedMessagePromise = createIsType<TypedMessagePromise>('promise')

export function makeTypedMessagePromise<T extends TypedMessage = TypedMessage>(
    promise: Promise<T>,
    alt?: TypedMessage,
): TypedMessagePromise<T> {
    const x: TypedMessagePromise<T> = {
        type: 'promise',
        serializable: false,
        promise,
        alt,
        meta: undefined,
    }
    promise.then((y) => ((x as any).value = y))
    return x
}
