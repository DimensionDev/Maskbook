import type { SerializableTypedMessage, TypedMessage } from '../base'

/** @internal */
export function createIsType<T extends TypedMessage>(x: string, version?: number) {
    return (y: TypedMessage): y is T => {
        if (version !== undefined && (y as SerializableTypedMessage<number>).version !== version) return false
        return y.type === x
    }
}
/** @internal */
export function composeSome<Args extends any[]>(...fns: ((...args: Args) => boolean)[]) {
    return (...args: Args) => fns.some((f) => f(...args))
}

export function composeEvery<Args extends any[]>(...fns: ((...args: Args) => boolean)[]) {
    return (...args: Args) => fns.every((f) => f(...args))
}
