import { isTypedMessageAnchor, isTypedMessageText, TypedMessage } from '@masknet/shared-base'

export function getTypedMessageContent(message: TypedMessage): string {
    if (isTypedMessageText(message)) return message.content
    if (isTypedMessageAnchor(message)) return message.href
    return ''
}
