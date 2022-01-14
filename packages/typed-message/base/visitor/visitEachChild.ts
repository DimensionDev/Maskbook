import {
    isTypedMessagePromise,
    isTypedMessageTuple,
    makeTypedMessageTuple,
    makeTypedMessageTupleSerializable,
} from '../core'
import { isSerializableTypedMessage } from '../utils'
import type { TypedMessage } from '../base'

export type Visitor = (message: TypedMessage) => TypedMessage
export function visitEachTypedMessageChild(node: TypedMessage, visitor: Visitor): TypedMessage {
    if (isTypedMessageTuple(node)) {
        const after = node.items.map(visitor)
        if (after.every(isSerializableTypedMessage)) {
            return makeTypedMessageTupleSerializable(after, node.meta)
        }
        return makeTypedMessageTuple(after, node.meta)
    }

    if (isTypedMessagePromise(node)) {
        if (node.value) return visitor(node.value)
    }

    if (isSerializableTypedMessage(node) && 'alt' in node) {
        const alt = visitor(node.alt)
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
