import { MaskMessages, CompositionRequest } from '../../../utils/messages'
import { makeTypedMessageText, TypedMessage } from '@masknet/shared-base'

export function openComposeBoxTwitter(content: string | TypedMessage, options?: CompositionRequest['options']) {
    MaskMessages.events.requestComposition.sendToLocal({
        reason: 'timeline',
        open: true,
        content: typeof content === 'string' ? makeTypedMessageText(content) : content,
        options,
    })
}
