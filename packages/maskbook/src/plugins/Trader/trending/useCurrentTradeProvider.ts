import { useValueRef } from '@masknet/shared'
import {
    ethereumNetworkTradeProviderSettings,
    polygonNetworkTradeProviderSettings,
    binanceNetworkTradeProviderSettings,
    arbitrumNetworkTradeProviderSettings,
    xdaiNetworkTradeProviderSettings,
} from '../settings'
import { getNetworkTypeFromChainId, NetworkType } from '@masknet/web3-shared-evm'
import { currentChainIdSettings } from '../../Wallet/settings'
import { unreachable } from '@dimensiondev/kit'
import { TradeProvider } from '@masknet/public-api'

export function useCurrentTradeProvider() {
    const networkType = getNetworkTypeFromChainId(currentChainIdSettings.value)
    const ethNetworkTradeProvider = useValueRef(ethereumNetworkTradeProviderSettings)
    const polygonNetworkTradeProvider = useValueRef(polygonNetworkTradeProviderSettings)
    const binanceNetworkTradeProvider = useValueRef(binanceNetworkTradeProviderSettings)
    const arbitrumNetworkTradeProvider = useValueRef(arbitrumNetworkTradeProviderSettings)
    const xdaiNetworkTradeProvider = useValueRef(xdaiNetworkTradeProviderSettings)

    if (!networkType) return TradeProvider.UNISWAP_V2
    switch (networkType) {
        case NetworkType.Ethereum:
            return ethNetworkTradeProvider
        case NetworkType.Polygon:
            return polygonNetworkTradeProvider
        case NetworkType.Binance:
            return binanceNetworkTradeProvider
        case NetworkType.Arbitrum:
            return arbitrumNetworkTradeProvider
        case NetworkType.xDai:
            return xdaiNetworkTradeProvider
        default:
            unreachable(networkType)
    }
}
