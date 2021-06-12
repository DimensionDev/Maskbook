import { unreachable } from '@dimensiondev/maskbook-shared'
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

export { resolveCollectibleProviderLink, resolveCollectibleLink } from '@dimensiondev/web3-shared'
