import {
    isTypedMessagePromise,
    isTypedMessageTuple,
    makeTypedMessageTuple,
    makeTypedMessageTupleSerializable,
} from '../core'
import { isSerializableTypedMessage } from '../utils'
import type { TypedMessage } from '../base'
import { isTypedMessageMaskPayload } from '../extension'
import type { TransformationContext, Transformer } from '../transformer'

export function visitEachTypedMessageChild(
    node: TypedMessage,
    visitor: Transformer,
    context: TransformationContext,
): TypedMessage {
    if (isTypedMessageTuple(node)) {
        const after = node.items.map(visitor)
        if (after.every(isSerializableTypedMessage)) {
            return makeTypedMessageTupleSerializable(after, node.meta)
        }
        return makeTypedMessageTuple(after, node.meta)
    }

    if (isTypedMessagePromise(node)) {
        if (node.value) return visitor(node.value, context)
    }

    if (isTypedMessageMaskPayload(node)) {
        const next = visitor(node.message, context)
    }

    if (isSerializableTypedMessage(node) && 'alt' in node) {
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
    }
    // return node with no child
    return node
}
