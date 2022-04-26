import { unreachable } from '@dimensiondev/kit'
import {
    ChainId,
    FilterTransactionType,
    NetworkType,
    FungibleAssetProvider,
    getZerionConstants,
    networkResolver,
} from '@masknet/web3-shared-evm'

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

export function resolveZerionAssetsScopeName(networkType: NetworkType) {
    return getZerionConstants(networkResolver.networkChainId(networkType)).ASSETS_SCOPE_NAME ?? ''
}

export function resolveZerionTransactionsScopeName(networkType: NetworkType) {
    return getZerionConstants(networkResolver.networkChainId(networkType)).TRANSACTIONS_SCOPE_NAME ?? ''
}
