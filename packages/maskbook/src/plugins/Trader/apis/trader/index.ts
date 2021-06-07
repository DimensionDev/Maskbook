import { ChainId, getNetworkTypeFromChainId, NetworkType } from '@dimensiondev/web3-shared'
import { TagType, TradeProvider } from '../../types'

export async function getAvailableTraderProviders(chainId: ChainId, type: TagType, keyword: string) {
    const networkType = getNetworkTypeFromChainId(chainId)

    if (networkType === NetworkType.Ethereum)
        return [
            TradeProvider.UNISWAP,
            TradeProvider.SUSHISWAP,
            TradeProvider.ZRX,
            TradeProvider.BALANCER,
            TradeProvider.SASHIMISWAP,
            TradeProvider.QUICKSWAP,
        ]
    return []
}
