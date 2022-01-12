import type { TypedMessage, NonSerializableTypedMessage } from '../base'
import { createIsType } from '../utils/internal'

export interface TypedMessagePromise<T extends TypedMessage = TypedMessage> extends NonSerializableTypedMessage {
    readonly type: 'promise'
    readonly promise: Promise<T>
    readonly value?: T
    /** Should this message be rendered when it's in the pending state? */
    readonly explicit?: boolean
    readonly meta?: undefined
}

export const isTypedMessagePromise = createIsType<TypedMessagePromise>('promise')

export function makeTypedMessagePromise<T extends TypedMessage = TypedMessage>(
    promise: Promise<T>,
    explicit = false,
): TypedMessagePromise<T> {
    const x: TypedMessagePromise<T> = {
        type: 'promise',
        serializable: false,
        promise,
        explicit,
        meta: undefined,
    }
    promise.then((y) => ((x as any).value = y))
    return x
}
