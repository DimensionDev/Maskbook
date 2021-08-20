import { MaskMessage, CompositionRequest } from '../../../utils/messages'
import { makeTypedMessageText, TypedMessage } from '../../../protocols/typed-message'

export function openComposeBoxTwitter(content: string | TypedMessage, options?: CompositionRequest['options']) {
    MaskMessage.events.requestComposition.sendToLocal({
        reason: 'timeline',
        open: true,
        content: typeof content === 'string' ? makeTypedMessageText(content) : content,
        options,
    })
}
