import { safeUnreachable } from '@masknet/kit'
import { TradeProvider } from '@masknet/public-api'
import { EMPTY_LIST } from '@masknet/shared-base'
import { NetworkType } from '@masknet/web3-shared-evm'

export function getEVMAvailableTraderProviders(networkType?: NetworkType) {
    if (!networkType) return EMPTY_LIST
    switch (networkType) {
        case NetworkType.Ethereum:
            return [
                TradeProvider.UNISWAP_V2,
                TradeProvider.UNISWAP_V3,
                TradeProvider.SUSHISWAP,
                TradeProvider.ZRX,
                TradeProvider.DODO,
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
                TradeProvider.OPENOCEAN,
                TradeProvider.TRISOLARIS,
            ]
        case NetworkType.Binance:
            return [
                TradeProvider.PANCAKESWAP,
                TradeProvider.SUSHISWAP,
                TradeProvider.DODO,
                TradeProvider.ZRX,
                TradeProvider.OPENOCEAN,
                TradeProvider.MDEX,
            ]
        case NetworkType.Base:
            return EMPTY_LIST
        case NetworkType.Arbitrum:
            return [TradeProvider.UNISWAP_V3, TradeProvider.OPENOCEAN, TradeProvider.DODO]
        case NetworkType.xDai:
            return [TradeProvider.SUSHISWAP, TradeProvider.OPENOCEAN]
        case NetworkType.Avalanche:
            return [TradeProvider.SUSHISWAP, TradeProvider.OPENOCEAN, TradeProvider.TRADERJOE, TradeProvider.PANGOLIN]
        case NetworkType.Celo:
            return [TradeProvider.SUSHISWAP]
        case NetworkType.Fantom:
            return [TradeProvider.SUSHISWAP]
        case NetworkType.Optimism:
            return [TradeProvider.UNISWAP_V3]
        case NetworkType.Aurora:
            return [TradeProvider.DODO, TradeProvider.WANNASWAP, TradeProvider.TRISOLARIS]
        case NetworkType.Astar:
            return [TradeProvider.ARTHSWAP, TradeProvider.VERSA, TradeProvider.ASTAREXCHANGE, TradeProvider.YUMISWAP]
        case NetworkType.Scroll:
        case NetworkType.Boba:
        case NetworkType.Fuse:
        case NetworkType.Metis:
        case NetworkType.Conflux:
        case NetworkType.Moonbeam:
        case NetworkType.CustomNetwork:
        case NetworkType.X1:
        case NetworkType.X1_Testnet:
            console.error('To be implement network:', networkType)
            return EMPTY_LIST
        default:
            safeUnreachable(networkType)
            return EMPTY_LIST
    }
}
