import type { NonSerializableWithToJSONTypedMessage, TypedMessage } from './base'
import { composeSome, createIsType } from './utils/internal'
import { makeTypedMessageText, TypedMessageText } from './core'
export type WellKnownExtensionTypedMessages = TypedMessageAnchor
/** It represents a single link */
export interface TypedMessageAnchor extends NonSerializableWithToJSONTypedMessage {
    readonly type: 'x-anchor'
    readonly category: 'normal' | 'user' | 'cash' | 'hash'
    readonly href: string
    readonly content: string
    readonly toJSON: TypedMessageText
}
export const isTypedMessageAnchor = createIsType<TypedMessageAnchor>('x-anchor')
export function makeTypedMessageAnchor(
    category: TypedMessageAnchor['category'],
    href: TypedMessageAnchor['href'],
    content: TypedMessageAnchor['content'],
): TypedMessageAnchor {
    return {
        type: 'x-anchor',
        serializable: false,
        category,
        href,
        content,
        toJSON: makeTypedMessageText(`[${content}](${href})`),
    }
}
//
export const isWellKnownExtensionTypedMessages = composeSome(isTypedMessageAnchor) as (
    x: TypedMessage,
) => x is WellKnownExtensionTypedMessages
