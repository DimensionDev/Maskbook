import { useValueRef } from '@masknet/shared'
import {
    ethereumNetworkTradeProviderSettings,
    polygonNetworkTradeProviderSettings,
    binanceNetworkTradeProviderSettings,
    arbitrumNetworkTradeProviderSettings,
    xdaiNetworkTradeProviderSettings,
    opNetworkTradeProviderSettings,
    celoNetworkTradeProviderSettings,
    fantomNetworkTradeProviderSettings,
    auroraNetworkTradeProviderSettings,
} from '../settings'
import { ChainId, getNetworkTypeFromChainId, NetworkType } from '@masknet/web3-shared-evm'
import { unreachable } from '@dimensiondev/kit'
import { TradeProvider } from '@masknet/public-api'
import { currentChainIdSettings } from '../../Wallet/settings'

export function useCurrentTradeProvider(chainId?: ChainId) {
    const networkType = getNetworkTypeFromChainId(chainId ?? currentChainIdSettings.value)
    const ethNetworkTradeProvider = useValueRef(ethereumNetworkTradeProviderSettings)
    const polygonNetworkTradeProvider = useValueRef(polygonNetworkTradeProviderSettings)
    const binanceNetworkTradeProvider = useValueRef(binanceNetworkTradeProviderSettings)
    const arbitrumNetworkTradeProvider = useValueRef(arbitrumNetworkTradeProviderSettings)
    const xdaiNetworkTradeProvider = useValueRef(xdaiNetworkTradeProviderSettings)
    const optimisticNetworkTradeProvider = useValueRef(opNetworkTradeProviderSettings)
    const celoNetworkTradeProvider = useValueRef(celoNetworkTradeProviderSettings)
    const fantomNetworkTradeProvider = useValueRef(fantomNetworkTradeProviderSettings)
    const auroraNetworkTradeProvider = useValueRef(auroraNetworkTradeProviderSettings)

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
        case NetworkType.Optimistic:
            return optimisticNetworkTradeProvider
        case NetworkType.Celo:
            return celoNetworkTradeProvider
        case NetworkType.Fantom:
            return fantomNetworkTradeProvider
        case NetworkType.Aurora:
            return auroraNetworkTradeProvider
        case NetworkType.Boba:
        case NetworkType.Fuse:
        case NetworkType.Metis:
        case NetworkType.Avalanche:
        case NetworkType.Optimistic:
            throw new Error(`To be implement network: ${networkType}`)
        default:
            unreachable(networkType)
    }
}
