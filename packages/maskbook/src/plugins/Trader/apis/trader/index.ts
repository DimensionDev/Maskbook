import { safeUnreachable } from '@dimensiondev/maskbook-shared'
import { ChainId, getNetworkTypeFromChainId, NetworkType } from '@dimensiondev/web3-shared'
import { TagType, TradeProvider } from '../../types'

export async function getAvailableTraderProviders(chainId: ChainId, type: TagType, keyword: string) {
    const networkType = getNetworkTypeFromChainId(chainId)

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
            return [TradeProvider.QUICKSWAP]
        case NetworkType.Binance:
            return []
        default:
            safeUnreachable(networkType)
            return []
    }
}
