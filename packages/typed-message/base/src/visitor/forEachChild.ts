import { isTypedMessagePromise, isTypedMessageTuple } from '../core/index.js'
import { isNonSerializableTypedMessageWithAlt } from '../utils/index.js'
import type { TypedMessage } from '../base.js'
import { isTypedMessageMaskPayload } from '../extension/index.js'

export function forEachTypedMessageChild(node: TypedMessage, visitor: (x: TypedMessage) => void | 'stop') {
    let stop: void | 'stop'
    if (isTypedMessageTuple(node)) {
        for (const each of node.items) {
            stop = visitor(each)
            if (stop) return
        }
    } else if (isTypedMessagePromise(node)) {
        // if Promise has a resolved value, we ignore it's alt.
        if ('value' in node.promise) visitor(node.promise.value)
        else if (node.alt) visitor(node.alt)
    } else if (isTypedMessageMaskPayload(node)) {
        visitor(node.message)
    } else if (isNonSerializableTypedMessageWithAlt(node)) {
        visitor(node.alt)
    }
}
