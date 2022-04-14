import {
    isTypedMessageEmpty,
    isTypedMessagePromise,
    isTypedMessageText,
    isTypedMessageTuple,
    makeTypedMessageEmpty,
    makeTypedMessageText,
    makeTypedMessageTuple,
    makeTypedMessageTupleSerializable,
} from '../core/index.js'
import type { TypedMessage } from '../base.js'
import { visitEachTypedMessageChild } from '../visitor/index.js'
import { isSerializableTypedMessage } from '../utils/index.js'
import { emptyTransformationContext, TransformationContext } from './context.js'

export function FlattenTypedMessage(message: TypedMessage, context: TransformationContext): TypedMessage {
    if (isTypedMessagePromise(message) && message.promise.value) return message.promise.value
    if (isTypedMessageTuple(message)) {
        const next = message.items
            .map((x) => FlattenTypedMessage(x, context))
            .flatMap((x) => (isTypedMessageTuple(x) ? (x.meta ? x : x.items) : x))
            .filter((x) => !isTypedMessageEmpty(x))
            .reduce<TypedMessage[]>((result, current) => {
                const lastItem = result.at(-1)
                if (!lastItem || lastItem.meta || current.meta) return result.concat(current)
                if (!isTypedMessageText(current) || !isTypedMessageText(lastItem)) return result.concat(current)
                // Only concat when last one and current one are both text and have no meta.
                result.pop()
                result.push(makeTypedMessageText(`${lastItem.content} ${current.content}`))
                return result
            }, [])

        if (!message.meta) {
            if (next.length === 0) return makeTypedMessageEmpty()
            if (next.length === 1) return next[0]
        }
        if (next.every(isSerializableTypedMessage)) return makeTypedMessageTupleSerializable(next, message.meta)
        return makeTypedMessageTuple(next, message.meta)
    }
    return visitEachTypedMessageChild(message, FlattenTypedMessage, context)
}
FlattenTypedMessage.NoContext = (message: TypedMessage) => FlattenTypedMessage(message, emptyTransformationContext)
