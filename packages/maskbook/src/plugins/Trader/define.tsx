import { PluginConfig, PluginStage, PluginScope } from '../types'
import {
    TypedMessage,
    isTypedMessageAnchor,
    TypedMessageAnchor,
    TypedMessageTuple,
} from '../../protocols/typed-message'
import { makeTypedMessageCashTrending } from './messages/TypedMessageCashTrending'
import { TagInspector } from './UI/trending/TagInspector'
import { PLUGIN_IDENTIFIER } from './constants'
import { SettingsDialog } from './UI/trader/SettingsDialog'
import { TraderDialog } from './UI/trader/TraderDialog'
import { SearchResultInspector } from './UI/trending/SearchResultInspector'

const isCashTagMessage = (m: TypedMessage): m is TypedMessageAnchor =>
    isTypedMessageAnchor(m) && ['cash', 'hash'].includes(m.category) && !/#[\w\d]+lbp$/i.test(m.content)

export const TraderPluginDefine: PluginConfig = {
    id: PLUGIN_IDENTIFIER,
    pluginIcon: '💱',
    pluginName: 'Trader',
    pluginDescription: 'View trending of cryptocurrencies, swap ERC20 tokens in various DEX markets.',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    messageProcessor(message: TypedMessageTuple) {
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
                <TraderDialog />
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
