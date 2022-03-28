import { MaskMessages, CompositionRequest } from '../../../utils/messages'
import { makeTypedMessageText, SerializableTypedMessages } from '@masknet/typed-message'

export function openComposeBoxTwitter(
    content: string | SerializableTypedMessages,
    options?: CompositionRequest['options'],
) {
    MaskMessages.events.requestComposition.sendToLocal({
        reason: 'timeline',
        open: true,
        content: typeof content === 'string' ? makeTypedMessageText(content) : content,
        options,
    })
}
