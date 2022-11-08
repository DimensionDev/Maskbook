import type { SerializableTypedMessage, TypedMessage } from '../base.js'

/** @internal */
export function createIsType<T extends TypedMessage>(x: T['type'], version?: number) {
    return (y: TypedMessage): y is T => {
        if (version !== undefined && (y as SerializableTypedMessage<number>).version !== version) return false
        return y.type === x
    }
}
/** @internal */
export function composeSome<Args extends any[]>(...fns: Array<(...args: Args) => boolean>) {
    return (...args: Args) => fns.some((f) => f(...args))
}

/** @internal */
export function composeEvery<Args extends any[]>(...fns: Array<(...args: Args) => boolean>) {
    return (...args: Args) => fns.every((f) => f(...args))
}
