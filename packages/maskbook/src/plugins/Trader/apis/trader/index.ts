import { TagType, TradeProvider } from '../../types'

export async function getAvailableTraderProviders(type: TagType, keyword: string) {
    return [
        TradeProvider.UNISWAP,
        TradeProvider.SUSHISWAP,
        TradeProvider.ZRX,
        TradeProvider.BALANCER,
        TradeProvider.SASHIMISWAP,
    ]
}
