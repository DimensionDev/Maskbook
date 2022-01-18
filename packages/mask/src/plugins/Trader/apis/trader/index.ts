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
                TradeProvider.BANCOR,
                TradeProvider.OPENOCEAN,
                TradeProvider.SOLARBEAM,
            ]
        case NetworkType.Polygon:
            return [
                TradeProvider.UNISWAP_V3,
                TradeProvider.QUICKSWAP,
                TradeProvider.SUSHISWAP,
                TradeProvider.DODO,
                TradeProvider.ZRX,
                TradeProvider.OPENOCEAN,
                TradeProvider.TRISOLARIS,
                TradeProvider.SOLARBEAM,
            ]
        case NetworkType.Binance:
            return [
                TradeProvider.PANCAKESWAP,
                TradeProvider.SUSHISWAP,
                TradeProvider.DODO,
                TradeProvider.ZRX,
                TradeProvider.OPENOCEAN,
                TradeProvider.SOLARBEAM,
            ]
        case NetworkType.Arbitrum:
            return [TradeProvider.UNISWAP_V3, TradeProvider.OPENOCEAN, TradeProvider.DODO]
        case NetworkType.xDai:
            return [TradeProvider.SUSHISWAP, TradeProvider.OPENOCEAN, TradeProvider.SOLARBEAM]
        case NetworkType.Celo:
            return [TradeProvider.SUSHISWAP, TradeProvider.SOLARBEAM]
        case NetworkType.Fantom:
            return [TradeProvider.SUSHISWAP]
        case NetworkType.Aurora:
            return [TradeProvider.DODO, TradeProvider.WANNASWAP, TradeProvider.TRISOLARIS]
        case NetworkType.Moonriver:
            return [TradeProvider.DODO, TradeProvider.SOLARBEAM, TradeProvider.SUSHISWAP, TradeProvider.HUCKLEBERRY]
        case NetworkType.Boba:
        case NetworkType.Fuse:
        case NetworkType.Metis:
        case NetworkType.Avalanche:
        case NetworkType.Optimistic:
            console.error('To be implement network: ', networkType)
            return []
        default:
            safeUnreachable(networkType)
            return []
    }
}
