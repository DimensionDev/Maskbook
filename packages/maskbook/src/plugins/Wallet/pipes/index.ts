import { safeUnreachable, unreachable } from '@dimensiondev/kit'
import { ChainId, NetworkType, PortfolioProvider } from '@masknet/web3-shared'
import type { SocketRequestAssetScope } from '../types'

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
        case NetworkType.Arbitrum:
            return 'arbitrum'
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
        case NetworkType.Arbitrum:
            return ''
        default:
            safeUnreachable(network)
            return ''
    }
}

export function resolveZerionTransactionsScopeName(network: NetworkType) {
    switch (network) {
        case NetworkType.Ethereum:
            return 'transactions'
        case NetworkType.Binance:
            return ''
        case NetworkType.Polygon:
            return ''
        case NetworkType.Arbitrum:
            return ''
        default:
            safeUnreachable(network)
            return ''
    }
}

export function resolveChainByScope(scope: SocketRequestAssetScope) {
    switch (scope) {
        case 'assets':
            return {
                chain: 'eth',
                chainId: ChainId.Mainnet,
            }
        case 'bsc-assets':
            return {
                chain: 'bsc',
                chainId: ChainId.BSC,
            }
        case 'polygon-assets':
            return {
                chain: 'matic',
                chainId: ChainId.Matic,
            }
        default:
            safeUnreachable(scope)
            return {
                chain: 'unknown',
            }
    }
}
