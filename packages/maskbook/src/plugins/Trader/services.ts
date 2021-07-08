export * from './apis'

import { unreachable } from '@dimensiondev/kit'
import { ChainId, getNetworkTypeFromChainId, NetworkType } from '@masknet/web3-shared'
import { currentChainIdSettings } from '../Wallet/settings'
import { currentTradeProviderSettings, currentDataProviderSettings } from './settings'
import { DataProvider, TradeProvider } from './types'

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
