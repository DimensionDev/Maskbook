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
import type { Meta, TypedMessage } from '../base.js'
import { visitEachTypedMessageChild } from '../visitor/index.js'
import { isSerializableTypedMessage } from '../utils/index.js'
import { emptyTransformationContext, type TransformationContext } from './context.js'
import { unstable_STYLE_META } from '../extension/index.js'
import { isEqual } from 'lodash-es'

export function FlattenTypedMessage(message: TypedMessage, context: TransformationContext): TypedMessage {
    if (isTypedMessagePromise(message) && 'value' in message.promise)
        return FlattenTypedMessage(message.promise.value, context)
    if (isTypedMessageTuple(message)) {
        const next = message.items
            .map((x) => FlattenTypedMessage(x, context))
            .flatMap((x) =>
                isTypedMessageTuple(x) ?
                    x.meta ?
                        x
                    :   x.items
                :   x,
            )
            .filter((x) => !isTypedMessageEmpty(x))
            .reduce<TypedMessage[]>((result, current) => {
                const lastItem = result.at(-1)
                if (!lastItem) return result.concat(current)
                if (!isTypedMessageText(current) || !isTypedMessageText(lastItem)) return result.concat(current)
                if (!isTextWithMetaCanBeMerged(lastItem.meta, current.meta)) return result.concat(current)
                // Only concat when last one and current one are both text and have no meta.
                result.pop()
                result.push(makeTypedMessageText(`${lastItem.content} ${current.content}`, lastItem.meta))
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

function isTextWithMetaCanBeMerged(a: Meta | undefined, b: Meta | undefined) {
    if (a === b) return true
    if (a?.size !== 1) return false
    if (a.size !== b?.size) return false
    if (!a.has(unstable_STYLE_META) || !b.has(unstable_STYLE_META)) return false
    const a_style = a.get(unstable_STYLE_META)!
    const b_style = b.get(unstable_STYLE_META)!
    return isEqual(a_style, b_style)
}
FlattenTypedMessage.NoContext = (message: TypedMessage) => FlattenTypedMessage(message, emptyTransformationContext)
