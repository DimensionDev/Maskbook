import type { Plugin } from '@masknet/plugin-infra'
import { visitEachTypedMessageChild } from '@masknet/typed-message'
import { isCashTagMessage, makeTypedMessageCashTrending } from './messages/TypedMessageCashTrending'

export const baseDeferred: Plugin.Shared.Utilities = {
    typedMessageTransformer: function visitor(message, context) {
        if (isCashTagMessage(message)) {
            return makeTypedMessageCashTrending(message)
        }
        return visitEachTypedMessageChild(message, visitor, context)
    },
}
