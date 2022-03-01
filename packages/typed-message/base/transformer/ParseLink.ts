import type { TypedMessage } from '../base'
import { isTypedMessageText, makeTypedMessageTupleSerializable, makeTypedMessageText } from '../core'
import { makeTypedMessageAnchor } from '../extension'
import { parseLink } from '../utils/parseLink'
import { visitEachTypedMessageChild } from '../visitor'
import type { TransformationContext } from './context'

export function ParseLinkTransformer(message: TypedMessage, context: TransformationContext): TypedMessage {
    if (isTypedMessageText(message)) {
        const parsed = parseLink(message.content)
        if (parsed.length === 1 && parsed[0].type === 'text') return message
        return makeTypedMessageTupleSerializable(
            parsed.map((i) => {
                if (i.type === 'text') return makeTypedMessageText(i.content)
                return makeTypedMessageAnchor(i.category, i.content, i.content)
            }),
            message.meta,
        )
    }
    return visitEachTypedMessageChild(message, ParseLinkTransformer, context)
}
