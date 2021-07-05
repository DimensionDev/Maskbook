import type { Plugin } from '@masknet/plugin-infra'
import { isTypedMessageAnchor, TypedMessage, TypedMessageAnchor, TypedMessageTuple } from '@masknet/shared'
import { base } from '../base'
import { makeTypedMessageCashTrending } from '../messages/TypedMessageCashTrending'
import { SettingsDialog } from './trader/SettingsDialog'
import { TraderDialog } from './trader/TraderDialog'
import { SearchResultInspector } from './trending/SearchResultInspector'
import { TagInspector } from './trending/TagInspector'

const isCashTagMessage = (m: TypedMessage): m is TypedMessageAnchor =>
    isTypedMessageAnchor(m) && ['cash', 'hash'].includes(m.category) && !/#[\w\d]+lbp$/i.test(m.content)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    SearchBoxComponent: SearchResultInspector,
    GlobalInjection: function Component() {
        return (
            <>
                <TagInspector />
                <SettingsDialog />
                <TraderDialog />
            </>
        )
    },
    typedMessageTransformer(message: TypedMessageTuple) {
        return {
            ...message,
            items: message.items.map((m: TypedMessage) => (isCashTagMessage(m) ? makeTypedMessageCashTrending(m) : m)),
        } as TypedMessageTuple
    },
}

export default sns
