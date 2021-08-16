export * from './apis'

import { unreachable } from '@dimensiondev/kit'
import { ChainId, getNetworkTypeFromChainId, NetworkType } from '@masknet/web3-shared'
import { currentChainIdSettings } from '../Wallet/settings'
import {
    currentTradeProviderSettings,
    currentDataProviderSettings,
    ethereumNetworkTradeProviderSettings,
    binanceNetworkTradeProviderSettings,
    polygonNetworkTradeProviderSettings,
} from './settings'
import { DataProvider, TradeProvider } from '@masknet/public-api'

currentChainIdSettings.addListener((chainId: ChainId) => {
    const networkType = getNetworkTypeFromChainId(chainId)
    if (!networkType) return
    switch (networkType) {
        case NetworkType.Ethereum:
            currentTradeProviderSettings.value = ethereumNetworkTradeProviderSettings.value
            break
        case NetworkType.Binance:
            currentTradeProviderSettings.value = binanceNetworkTradeProviderSettings.value
            if (currentDataProviderSettings.value === DataProvider.UNISWAP_INFO)
                currentDataProviderSettings.value = DataProvider.COIN_GECKO
            break
        case NetworkType.Polygon:
            currentTradeProviderSettings.value = polygonNetworkTradeProviderSettings.value
            if (currentDataProviderSettings.value === DataProvider.UNISWAP_INFO)
                currentDataProviderSettings.value = DataProvider.COIN_GECKO
            break
        case NetworkType.Arbitrum:
            currentTradeProviderSettings.value = TradeProvider.UNISWAP_V2
            if (currentDataProviderSettings.value === DataProvider.UNISWAP_INFO)
                currentDataProviderSettings.value = DataProvider.COIN_MARKET_CAP
            break
        default:
            unreachable(networkType)
    }
})

currentTradeProviderSettings.addListener((tradeProvier: TradeProvider) => {
    const networkType = getNetworkTypeFromChainId(currentChainIdSettings.value)
    if (!networkType) return
    switch (networkType) {
        case NetworkType.Ethereum:
            ethereumNetworkTradeProviderSettings.value = tradeProvier
            break
        case NetworkType.Binance:
            binanceNetworkTradeProviderSettings.value = tradeProvier
            break
        case NetworkType.Polygon:
            polygonNetworkTradeProviderSettings.value = tradeProvier
            break
        case NetworkType.Arbitrum:
            throw new Error('TODO')
        default:
            unreachable(networkType)
    }
})
