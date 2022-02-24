import { isTypedMessagePromise, isTypedMessageTuple } from '../core'
import { isNonSerializableTypedMessageWithAlt } from '../utils'
import type { TypedMessage } from '../base'
import { isTypedMessageMaskPayload } from '../extension'

export function forEachTypedMessageChild(node: TypedMessage, visitor: (x: TypedMessage) => void | 'stop') {
    let stop: void | 'stop'
    if (isTypedMessageTuple(node)) {
        for (const each of node.items) {
            stop = visitor(each)
            if (stop) return
        }
    } else if (isTypedMessagePromise(node)) {
        // if Promise has a resolved value, we ignore it's alt.
        if (node.promise.value) visitor(node.promise.value)
        else if (node.alt) visitor(node.alt)
    } else if (isTypedMessageMaskPayload(node)) {
        visitor(node.message)
    } else if (isNonSerializableTypedMessageWithAlt(node)) {
        visitor(node.alt)
    }
}
