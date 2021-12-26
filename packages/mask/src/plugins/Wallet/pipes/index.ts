import { unreachable } from '@dimensiondev/kit'
import {
    ChainId,
    createLookupTableResolver,
    FilterTransactionType,
    NetworkType,
    FungibleAssetProvider,
    getChainIdFromNetworkType,
    getZerionConstants,
} from '@masknet/web3-shared-evm'
import type { SocketRequestAssetScope } from '../types'

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
    return getZerionConstants(getChainIdFromNetworkType(networkType)).ASSETS_SCOPE_NAME ?? ''
}

export function resolveZerionTransactionsScopeName(networkType: NetworkType) {
    return getZerionConstants(getChainIdFromNetworkType(networkType)).TRANSACTIONS_SCOPE_NAME ?? ''
}

export const resolveChainByScope = createLookupTableResolver<
    SocketRequestAssetScope,
    {
        chain: string
        chainId?: ChainId
    }
>(
    {
        assets: {
            chain: 'eth',
            chainId: ChainId.Mainnet,
        },
        'bsc-assets': {
            chain: 'bsc',
            chainId: ChainId.BSC,
        },
        'polygon-assets': {
            chain: 'matic',
            chainId: ChainId.Matic,
        },
        'fantom-assets': {
            chain: 'ftm',
            chainId: ChainId.Matic,
        },
    },
    {
        chain: 'unknown',
    },
)
