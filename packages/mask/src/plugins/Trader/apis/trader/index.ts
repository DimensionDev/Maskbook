import { safeUnreachable } from '@dimensiondev/kit'
import { TradeProvider } from '@masknet/public-api'
import { ChainId, getNetworkTypeFromChainId, NetworkType } from '@masknet/web3-shared-evm'

export async function getAvailableTraderProviders(chainId: ChainId) {
    const networkType = getNetworkTypeFromChainId(chainId)
    if (!networkType) return []
    switch (networkType) {
        case NetworkType.Ethereum:
            return [
                TradeProvider.UNISWAP_V2,
                TradeProvider.UNISWAP_V3,
                TradeProvider.SUSHISWAP,
                TradeProvider.SASHIMISWAP,
                TradeProvider.ZRX,
                TradeProvider.BALANCER,
                TradeProvider.DODO,
                TradeProvider.ONE_INCH,
                TradeProvider.BANCOR,
                TradeProvider.OPENOCEAN,
            ]
        case NetworkType.Polygon:
            return [
                TradeProvider.UNISWAP_V3,
                TradeProvider.QUICKSWAP,
                TradeProvider.SUSHISWAP,
                TradeProvider.DODO,
                TradeProvider.ZRX,
                TradeProvider.ONE_INCH,
                TradeProvider.OPENOCEAN,
            ]
        case NetworkType.Binance:
            return [
                TradeProvider.PANCAKESWAP,
                TradeProvider.SUSHISWAP,
                TradeProvider.DODO,
                TradeProvider.ZRX,
                TradeProvider.ONE_INCH,
                TradeProvider.OPENOCEAN,
            ]
        case NetworkType.Arbitrum:
            return [TradeProvider.UNISWAP_V3, TradeProvider.OPENOCEAN]
        case NetworkType.xDai:
            return [TradeProvider.SUSHISWAP, TradeProvider.OPENOCEAN]
        case NetworkType.Celo:
            return [TradeProvider.SUSHISWAP]
        case NetworkType.Fantom:
            return [TradeProvider.SUSHISWAP]
        default:
            safeUnreachable(networkType)
            return []
    }
}
