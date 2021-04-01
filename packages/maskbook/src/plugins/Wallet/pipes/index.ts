import { unreachable } from '../../../utils/utils'
import type { ERC1155TokenDetailed, ERC721TokenDetailed } from '../../../web3/types'
import { CollectibleProvider, PortfolioProvider } from '../types'

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

export function resolveCollectibleProviderLink(provider: CollectibleProvider) {
    switch (provider) {
        case CollectibleProvider.OPENSEAN:
            return 'https://opensea.io/'
        default:
            unreachable(provider)
    }
}

export function resolveCollectibleLink(
    provider: CollectibleProvider,
    token: ERC721TokenDetailed | ERC1155TokenDetailed,
) {
    switch (provider) {
        case CollectibleProvider.OPENSEAN:
            return `https://opensea.io/assets/${token.address}/${token.tokenId}`
        default:
            unreachable(provider)
    }
}
