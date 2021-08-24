import { useValueRef } from '@masknet/shared'
import {
    ethereumNetworkTradeProviderSettings,
    polygonNetworkTradeProviderSettings,
    binanceNetworkTradeProviderSettings,
    arbitrumNetworkTradeProviderSettings,
} from '../settings'
import { TradeProvider } from '../types'
import { getNetworkTypeFromChainId } from '@masknet/web3-shared'
import { currentChainIdSettings } from '../../Wallet/settings'
import { unreachable } from '@dimensiondev/kit'
import { NetworkType } from '@masknet/public-api'

export function useCurrentTradeProvider() {
    const networkType: NetworkType | undefined = getNetworkTypeFromChainId(currentChainIdSettings.value)
    const ethNetworkTradeProvider = useValueRef(ethereumNetworkTradeProviderSettings)
    const polygonNetworkTradeProvider = useValueRef(polygonNetworkTradeProviderSettings)
    const binanceNetworkTradeProvider = useValueRef(binanceNetworkTradeProviderSettings)
    const arbitrumNetworkTradeProvider = useValueRef(arbitrumNetworkTradeProviderSettings)

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
        default:
            unreachable(networkType)
    }
}
