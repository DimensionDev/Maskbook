import { unreachable } from '@dimensiondev/kit'
import { FilterTransactionType, FungibleAssetProvider } from '@masknet/web3-shared-evm'

export function resolvePortfolioDataProviderName(provider: FungibleAssetProvider) {
    switch (provider) {
        case FungibleAssetProvider.ZERION:
            return 'Zerion'
        case FungibleAssetProvider.DEBANK:
            return 'Debank'
        default:
            unreachable(provider)
    }
}

export function resolveDebankTransactionType(category: string) {
    switch (category) {
        case 'send':
            return FilterTransactionType.SEND
        case 'receive':
            return FilterTransactionType.RECEIVE
        default:
            return FilterTransactionType.ALL
    }
}
