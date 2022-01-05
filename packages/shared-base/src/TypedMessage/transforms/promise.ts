import { isTypedMessagePromise, isTypedMessageTuple, TypedMessage } from '..'
import { flattenTypedMessage } from './flatten'

export function hasPromise(x: TypedMessage) {
    if (isTypedMessagePromise(x)) return true
    if (isTypedMessageTuple(x)) return x.items.some(hasPromise)
    return false
}

export async function waitTypedMessage(x: TypedMessage): Promise<TypedMessage> {
    if (!hasPromise(x)) return x
    const promise = collectPromise(x)
    await Promise.allSettled(promise)
    return flattenTypedMessage(x)
}

function collectPromise(x: TypedMessage, result: Promise<TypedMessage>[] = []): Promise<TypedMessage>[] {
    if (isTypedMessagePromise(x)) return result.concat(x.promise)
    if (isTypedMessageTuple(x)) {
        return result.concat(x.items.flatMap((x) => collectPromise(x)))
    }
    return result
}
