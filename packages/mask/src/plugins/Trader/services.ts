export * from './apis'

import { unreachable } from '@dimensiondev/kit'
import { ChainId, getNetworkTypeFromChainId, NetworkType } from '@masknet/web3-shared-evm'
import { currentChainIdSettings } from '../Wallet/settings'
import {
    currentTradeProviderSettings,
    currentDataProviderSettings,
    ethereumNetworkTradeProviderSettings,
    binanceNetworkTradeProviderSettings,
    polygonNetworkTradeProviderSettings,
    arbitrumNetworkTradeProviderSettings,
    xdaiNetworkTradeProviderSettings,
    celoNetworkTradeProviderSettings,
    fantomNetworkTradeProviderSettings,
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
            currentTradeProviderSettings.value = TradeProvider.UNISWAP_V3
            if (currentDataProviderSettings.value === DataProvider.UNISWAP_INFO)
                currentDataProviderSettings.value = DataProvider.COIN_MARKET_CAP
            break
        case NetworkType.xDai:
            currentTradeProviderSettings.value = TradeProvider.SUSHISWAP
            if (currentDataProviderSettings.value === DataProvider.UNISWAP_INFO)
                currentDataProviderSettings.value = DataProvider.COIN_MARKET_CAP
            break
        case NetworkType.Celo:
            currentTradeProviderSettings.value = TradeProvider.SUSHISWAP
            if (currentDataProviderSettings.value === DataProvider.UNISWAP_INFO)
                currentDataProviderSettings.value = DataProvider.COIN_GECKO
            break
        case NetworkType.Fantom:
            currentTradeProviderSettings.value = TradeProvider.SUSHISWAP
            if (currentDataProviderSettings.value === DataProvider.UNISWAP_INFO)
                currentDataProviderSettings.value = DataProvider.COIN_MARKET_CAP
            break
        default:
            unreachable(networkType)
    }
})

currentTradeProviderSettings.addListener((tradeProvider: TradeProvider) => {
    const networkType = getNetworkTypeFromChainId(currentChainIdSettings.value)
    if (!networkType) return
    switch (networkType) {
        case NetworkType.Ethereum:
            ethereumNetworkTradeProviderSettings.value = tradeProvider
            break
        case NetworkType.Binance:
            binanceNetworkTradeProviderSettings.value = tradeProvider
            break
        case NetworkType.Polygon:
            polygonNetworkTradeProviderSettings.value = tradeProvider
            break
        case NetworkType.Arbitrum:
            arbitrumNetworkTradeProviderSettings.value = tradeProvider
            break
        case NetworkType.xDai:
            xdaiNetworkTradeProviderSettings.value = tradeProvider
            break
        case NetworkType.Celo:
            celoNetworkTradeProviderSettings.value = tradeProvider
            break
        case NetworkType.Fantom:
            fantomNetworkTradeProviderSettings.value = tradeProvider
            break
        default:
            unreachable(networkType)
    }
})
