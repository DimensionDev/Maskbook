import type { Asset } from './types'
import { CurrencyType, ChainId, NonFungibleTokenDetailed, NetworkType } from '@dimensiondev/web3-shared'
import { CollectibleProvider } from './types'
import { safeUnreachable, unreachable } from '@dimensiondev/maskbook-shared'

export const getTokenUSDValue = (token: Asset) => (token.value ? Number.parseFloat(token.value[CurrencyType.USD]) : 0)

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

export function resolveNetworkName(networkType: NetworkType) {
    switch (networkType) {
        case NetworkType.Binance:
            return 'Binance'
        case NetworkType.Polygon:
            return 'Polygon'
        case NetworkType.Ethereum:
            return 'Ethereum'
        default:
            safeUnreachable(networkType)
            return 'Unknown'
    }
}
