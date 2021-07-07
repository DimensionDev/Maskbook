import { safeUnreachable, unreachable } from '@dimensiondev/kit'
import { ChainId, CollectibleProvider, NetworkType, NonFungibleTokenDetailed } from '@masknet/web3-shared'
import { PortfolioProvider } from '../types'

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

export function resolveCollectibleProviderLink(chainId: ChainId, provider: CollectibleProvider) {
    switch (provider) {
        case CollectibleProvider.OPENSEAN:
            if (chainId === ChainId.Rinkeby) return `https://testnets.opensea.io`
            return `https://opensea.io`
        default:
            unreachable(provider)
    }
}

export function resolveCollectibleLink(
    chainId: ChainId,
    provider: CollectibleProvider,
    token: NonFungibleTokenDetailed,
) {
    switch (provider) {
        case CollectibleProvider.OPENSEAN:
            return `${resolveCollectibleProviderLink(chainId, provider)}/assets/${token.address}/${token.tokenId}`
        default:
            unreachable(provider)
    }
}
