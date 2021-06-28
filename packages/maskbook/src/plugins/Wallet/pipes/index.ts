import { unreachable } from '@dimensiondev/kit'
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

export { resolveCollectibleProviderLink, resolveCollectibleLink } from '@masknet/web3-shared'
