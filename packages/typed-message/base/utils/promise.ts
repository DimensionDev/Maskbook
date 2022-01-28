import { FlattenTypedMessage } from '../transformer/Flatten'
import { isTypedMessagePromise, isTypedMessageTuple } from '../core'
import type { TypedMessage } from '../base'
import { emptyTransformationContext } from '../transformer'

export function collectTypedMessagePromise(
    x: TypedMessage,
    result: Promise<TypedMessage>[] = [],
): Promise<TypedMessage>[] {
    if (isTypedMessagePromise(x))
        return result.concat(x.promise.then((x) => FlattenTypedMessage(x, emptyTransformationContext)))
    if (isTypedMessageTuple(x)) {
        return result.concat(x.items.flatMap((x) => collectTypedMessagePromise(x)))
    }
    return result
}
