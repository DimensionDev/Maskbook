import { MaskMessage } from '../../../utils/messages'
import { makeTypedMessageText, TypedMessage } from '../../../protocols/typed-message'

export function openComposeBoxTwitter(
    content: string | TypedMessage,
    options?: {
        onlyMySelf?: boolean
        shareToEveryOne?: boolean
    },
) {
    MaskMessage.events.compositionUpdated.sendToLocal({
        reason: 'timeline',
        open: true,
        content: typeof content === 'string' ? makeTypedMessageText(content) : content,
        options,
    })
}
