import {
    isTypedMessagePromise,
    isTypedMessageTuple,
    makeTypedMessagePromise,
    makeTypedMessageTuple,
    makeTypedMessageTupleSerializable,
} from '../core'
import { isNonSerializableTypedMessageWithAlt, isSerializableTypedMessage } from '../utils'
import type { TypedMessage } from '../base'
import { isTypedMessageMaskPayload, makeTypedMessageMaskPayload } from '../extension'
import type { TransformationContext, Transformer } from '../transformer'

export function visitEachTypedMessageChild(
    node: TypedMessage,
    visitor: Transformer,
    context: TransformationContext,
): TypedMessage {
    if (isTypedMessageTuple(node)) {
        const after = node.items.flatMap((x) => {
            const next = visitor(x, context)
            if (isTypedMessageTuple(next)) return next.items
            return next
        })
        if (after.every(isSerializableTypedMessage)) {
            return makeTypedMessageTupleSerializable(after, node.meta)
        }
        return makeTypedMessageTuple(after, node.meta)
    } else if (isTypedMessagePromise(node)) {
        // we ignore alt if promise is resolved.
        if (node.promise.value) return visitor(node.promise.value, context)
        else if (node.alt) return makeTypedMessagePromise(node.promise, visitor(node.alt, context))
        return node
    } else if (isTypedMessageMaskPayload(node)) {
        const next = visitor(node.message, context)
        return makeTypedMessageMaskPayload(next, node.meta)
    } else if (isNonSerializableTypedMessageWithAlt(node)) {
        const alt = visitor(node.alt, context)
        if (!isSerializableTypedMessage(alt)) {
            console.warn(
                '[@masknet/typed-message] You must return a serializable message in this position. Original:',
                node,
                'Transformed child "alt":',
                alt,
            )
            // ignore the transform result
            return node
        }
        return { ...node, alt } as TypedMessage
    } else {
        // return node with no child
        return node
    }
}
