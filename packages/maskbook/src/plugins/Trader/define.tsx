import { PluginConfig, PluginStage, PluginScope } from '../types'
import {
    TypedMessage,
    isTypedMessageAnchor,
    TypedMessageAnchor,
    TypedMessageCompound,
} from '../../protocols/typed-message'
import { makeTypedMessageCashTrending } from './messages/TypedMessageCashTrending'
import { TagInspector } from './UI/trending/TagInspector'
import { PLUGIN_IDENTIFIER } from './constants'
import { SettingsDialog } from './UI/trader/SettingsDialog'
import { SearchResultInspector } from './UI/trending/SearchResultInspector'

const isCashTagMessage = (m: TypedMessage): m is TypedMessageAnchor =>
    isTypedMessageAnchor(m) && ['cash', 'hash'].includes(m.category) && !/#[\w\d]+lbp$/i.test(m.content)

export const TraderPluginDefine: PluginConfig = {
    pluginName: 'Trader',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    messageProcessor(message: TypedMessageCompound) {
        return {
            ...message,
            items: message.items.map((m: TypedMessage) => (isCashTagMessage(m) ? makeTypedMessageCashTrending(m) : m)),
        }
    },
    SearchBoxComponent: SearchResultInspector,
    PageComponent() {
        return (
            <>
                <TagInspector />
                <SettingsDialog />
            </>
        )
    },
    DashboardComponent() {
        return (
            <>
                <SettingsDialog />
            </>
        )
    },
}
