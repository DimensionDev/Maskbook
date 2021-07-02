import { safeUnreachable } from '@dimensiondev/kit'
import { getNetworkTypeFromChainId, NetworkType } from '@masknet/web3-shared'
import { currentChainIdSettings } from '../../../Wallet/settings'
import { TagType, TradeProvider } from '../../types'

export async function getAvailableTraderProviders(type?: TagType, keyword?: string) {
    const networkType = getNetworkTypeFromChainId(currentChainIdSettings.value)

    switch (networkType) {
        case NetworkType.Ethereum:
            return [
                TradeProvider.UNISWAP,
                TradeProvider.SUSHISWAP,
                TradeProvider.SASHIMISWAP,
                TradeProvider.ZRX,
                TradeProvider.BALANCER,
            ]
        case NetworkType.Polygon:
            return [TradeProvider.QUICKSWAP, TradeProvider.SUSHISWAP]
        case NetworkType.Binance:
            return [TradeProvider.PANCAKESWAP, TradeProvider.SUSHISWAP, TradeProvider.SASHIMISWAP]
        default:
            safeUnreachable(networkType)
            return []
    }
}
