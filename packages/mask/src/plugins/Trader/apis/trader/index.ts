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
                TradeProvider.MDEX,
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
                TradeProvider.TRISOLARIS,
            ]
        case NetworkType.Binance:
            return [
                TradeProvider.PANCAKESWAP,
                TradeProvider.SUSHISWAP,
                TradeProvider.DODO,
                TradeProvider.ZRX,
                TradeProvider.ONE_INCH,
                TradeProvider.OPENOCEAN,
                TradeProvider.MDEX,
            ]
        case NetworkType.Arbitrum:
            return [TradeProvider.UNISWAP_V3, TradeProvider.OPENOCEAN, TradeProvider.DODO, TradeProvider.ONE_INCH]
        case NetworkType.xDai:
            return [TradeProvider.SUSHISWAP, TradeProvider.OPENOCEAN]
        case NetworkType.Avalanche:
            return [
                TradeProvider.SUSHISWAP,
                TradeProvider.OPENOCEAN,
                TradeProvider.TRADERJOE,
                TradeProvider.PANGOLIN,
                TradeProvider.ONE_INCH,
            ]
        case NetworkType.xDai:
            return [TradeProvider.SUSHISWAP, TradeProvider.OPENOCEAN, TradeProvider.ONE_INCH]
        case NetworkType.Celo:
            return [TradeProvider.SUSHISWAP]
        case NetworkType.Fantom:
            return [TradeProvider.SUSHISWAP]
        case NetworkType.Aurora:
            return [TradeProvider.DODO, TradeProvider.WANNASWAP, TradeProvider.TRISOLARIS]
        case NetworkType.Harmony:
            return [
                TradeProvider.SUSHISWAP,
                TradeProvider.VENOMSWAP,
                TradeProvider.OPENSWAP,
                TradeProvider.DEFIKINGDOMS,
            ]
        case NetworkType.Boba:
        case NetworkType.Fuse:
        case NetworkType.Metis:
        case NetworkType.Optimistic:
        case NetworkType.Conflux:
            console.error('To be implement network: ', networkType)
            return []
        default:
            safeUnreachable(networkType)
            return []
    }
}
