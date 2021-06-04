import { getChainDetailed } from '@dimensiondev/web3-shared'
import { TagType, TradeProvider } from '../../types'

export async function getAvailableTraderProviders(type: TagType, keyword: string) {
    const chainDetailed = getChainDetailed()

    if (chainDetailed?.chain === 'ETH')
        return [
            TradeProvider.UNISWAP,
            TradeProvider.SUSHISWAP,
            TradeProvider.ZRX,
            TradeProvider.BALANCER,
            TradeProvider.SASHIMISWAP,
        ]
    return []
}
