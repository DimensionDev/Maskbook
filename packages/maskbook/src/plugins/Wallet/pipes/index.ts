import { safeUnreachable, unreachable } from '@dimensiondev/kit'
import { NetworkType } from '@masknet/web3-shared'
import { PortfolioProvider } from '../types'

export { resolveCollectibleProviderLink, resolveCollectibleLink } from '@masknet/web3-shared'

export function resolvePortfolioDataProviderName(provider: PortfolioProvider) {
    switch (provider) {
        case PortfolioProvider.ZERION:
            return 'Zerion'
        case PortfolioProvider.DEBANK:
            return 'Debank'
        default:
            unreachable(provider)
    }
}

export function resolveDebankChainName(network: NetworkType) {
    switch (network) {
        case NetworkType.Ethereum:
            return 'eth'
        case NetworkType.Binance:
            return 'bsc'
        case NetworkType.Polygon:
            return 'matic'
        default:
            safeUnreachable(network)
            return ''
    }
}

export function resolveZerionAssetsScopeName(network: NetworkType) {
    switch (network) {
        case NetworkType.Ethereum:
            return 'assets'
        case NetworkType.Binance:
            return 'bsc-assets'
        case NetworkType.Polygon:
            return 'polygon-assets'
        default:
            safeUnreachable(network)
            return ''
    }
}
