import { ChainId, getNetworkTypeFromChainId, NetworkType } from '@masknet/web3-shared'
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
import { currentChainIdSettings } from '../Wallet/settings'
import { currentTradeProviderSettings, currentDataProviderSettings } from './settings'
import { DataProvider, TradeProvider } from './types'
import { unreachable } from '@masknet/shared'

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

currentChainIdSettings.addListener((chainId: ChainId) => {
    const networkType = getNetworkTypeFromChainId(chainId)
    switch (networkType) {
        case NetworkType.Ethereum:
            if ([TradeProvider.PANCAKESWAP, TradeProvider.QUICKSWAP].includes(currentTradeProviderSettings.value))
                currentTradeProviderSettings.value = TradeProvider.UNISWAP
            break
        case NetworkType.Binance:
            currentTradeProviderSettings.value = TradeProvider.PANCAKESWAP
            if (currentDataProviderSettings.value === DataProvider.UNISWAP_INFO)
                currentDataProviderSettings.value = DataProvider.COIN_MARKET_CAP
            break
        case NetworkType.Polygon:
            currentTradeProviderSettings.value = TradeProvider.QUICKSWAP
            if (currentDataProviderSettings.value === DataProvider.UNISWAP_INFO)
                currentDataProviderSettings.value = DataProvider.COIN_MARKET_CAP
            break
        default:
            unreachable(networkType)
    }
})
