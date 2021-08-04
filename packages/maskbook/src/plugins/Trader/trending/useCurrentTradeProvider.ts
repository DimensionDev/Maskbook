import { useValueRef } from '@masknet/shared'
import {
    ethNetworkTradeProviderSettings,
    polygonNetworkTradeProviderSettings,
    bscNetworkTradeProviderSettings,
} from '../settings'
import { TradeProvider } from '../types'
import { getNetworkTypeFromChainId, NetworkType } from '@masknet/web3-shared'
import { currentChainIdSettings } from '../../Wallet/settings'

export function useCurrentTradeProvider(availableTradeProviders: TradeProvider[]) {
    const networkType = getNetworkTypeFromChainId(currentChainIdSettings.value)
    const ethNetworkTradeProvider = useValueRef(ethNetworkTradeProviderSettings)
    const polygonNetworkTradeProvider = useValueRef(polygonNetworkTradeProviderSettings)
    const bscNetworkTradeProvider = useValueRef(bscNetworkTradeProviderSettings)

    if (!networkType) return TradeProvider.UNISWAP
    switch (networkType) {
        case NetworkType.Ethereum:
            return ethNetworkTradeProvider
        case NetworkType.Polygon:
            return polygonNetworkTradeProvider
        case NetworkType.Binance:
            return bscNetworkTradeProvider
        default:
            return TradeProvider.UNISWAP
    }
}
