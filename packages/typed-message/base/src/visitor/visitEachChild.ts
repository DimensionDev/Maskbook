import {
    isTypedMessagePromise,
    isTypedMessageTuple,
    makeTypedMessagePromise,
    makeTypedMessageTuple,
    makeTypedMessageTupleSerializable,
} from '../core/index.js'
import { isNonSerializableTypedMessageWithAlt, isSerializableTypedMessage } from '../utils/index.js'
import type { TypedMessage } from '../base.js'
import { isTypedMessageMaskPayload, makeTypedMessageMaskPayload } from '../extension/index.js'
import type { TransformationContext, Transformer } from '../transformer/index.js'

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
        if ('value' in node.promise) return visitor(node.promise.value, context)
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
