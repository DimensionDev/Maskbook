import { isTypedMessagePromise } from '../core'
import type { TypedMessage } from '../base'
import { forEachTypedMessageChild } from '../visitor/forEachChild'

export function collectTypedMessagePromise(x: TypedMessage): Promise<TypedMessage>[] {
    const result: Promise<TypedMessage>[] = []
    forEachTypedMessageChild(x, function visitor(x: TypedMessage) {
        if (isTypedMessagePromise(x)) return result.push(x.promise)
        return forEachTypedMessageChild(x, visitor)
    })
    return result
}
