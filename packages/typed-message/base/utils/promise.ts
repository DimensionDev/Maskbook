import { FlattenTypedMessage } from '../transformer/Flatten'
import { isTypedMessagePromise, isTypedMessageTuple } from '../core'
import type { TypedMessage } from '../base'
import { createTransformationContext } from '../transformer'

export function hasPromise(x: TypedMessage) {
    if (isTypedMessagePromise(x)) return true
    if (isTypedMessageTuple(x)) return x.items.some(hasPromise)
    return false
}

export function collectTypedMessagePromise(
    x: TypedMessage,
    result: Promise<TypedMessage>[] = [],
): Promise<TypedMessage>[] {
    if (isTypedMessagePromise(x))
        return result.concat(x.promise.then((x) => FlattenTypedMessage(x, createTransformationContext())))
    if (isTypedMessageTuple(x)) {
        return result.concat(x.items.flatMap((x) => collectTypedMessagePromise(x)))
    }
    return result
}
