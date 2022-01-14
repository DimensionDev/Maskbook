import type { TypedMessage } from '../base'
import { visitEachTypedMessageChild } from '../visitor'

export function ParseLinkTransformer(message: TypedMessage): TypedMessage {
    return visitEachTypedMessageChild(message, ParseLinkTransformer)
}
