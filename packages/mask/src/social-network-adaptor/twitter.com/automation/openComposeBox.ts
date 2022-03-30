import { CrossIsolationMessages, CompositionRequest } from '@masknet/shared-base'
import { makeTypedMessageText, SerializableTypedMessages } from '@masknet/typed-message'

export function openComposeBoxTwitter(
    content: string | SerializableTypedMessages,
    options?: CompositionRequest['options'],
) {
    CrossIsolationMessages.events.requestComposition.sendToLocal({
        reason: 'timeline',
        open: true,
        content: typeof content === 'string' ? makeTypedMessageText(content) : content,
        options,
    })
}
