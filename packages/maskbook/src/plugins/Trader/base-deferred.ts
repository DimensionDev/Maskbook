import type { Plugin } from '@masknet/plugin-infra'
import type { TypedMessage, TypedMessageTuple } from '@masknet/shared'
import { isCashTagMessage, makeTypedMessageCashTrending } from './messages/TypedMessageCashTrending'

export const baseDeferred: Plugin.Shared.Utilities = {
    typedMessageTransformer(message) {
        return {
            ...message,
            items: message.items.map((m: TypedMessage) => (isCashTagMessage(m) ? makeTypedMessageCashTrending(m) : m)),
        } as TypedMessageTuple
    },
}
