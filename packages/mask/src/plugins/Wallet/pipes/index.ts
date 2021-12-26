import { unreachable } from '@dimensiondev/kit'
import {
    ChainId,
    createLookupTableResolver,
    FilterTransactionType,
    NetworkType,
    FungibleAssetProvider,
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

export const resolveDebankChainName = createLookupTableResolver<NetworkType, string>(
    {
        [NetworkType.Ethereum]: 'eth',
        [NetworkType.Binance]: 'bsc',
        [NetworkType.Polygon]: 'matic',
        [NetworkType.Fantom]: 'ftm',
        [NetworkType.Arbitrum]: 'arb',
        [NetworkType.xDai]: 'xdai',
    },
    '',
)

export const resolveZerionAssetsScopeName = createLookupTableResolver<NetworkType, string>(
    {
        [NetworkType.Ethereum]: 'assets',
        [NetworkType.Binance]: 'bsc-assets',
        [NetworkType.Polygon]: 'polygon-assets',
        [NetworkType.Arbitrum]: 'arbitrum-assets',
        [NetworkType.xDai]: 'xdai-assets',
    },
    '',
)

export const resolveZerionTransactionsScopeName = createLookupTableResolver<NetworkType, string>(
    {
        [NetworkType.Ethereum]: 'transactions',
        [NetworkType.Binance]: 'bsc-transactions',
        [NetworkType.Polygon]: 'polygon-transactions',
        [NetworkType.Arbitrum]: 'arbitrum-transactions',
        [NetworkType.xDai]: 'xdai-transactions',
    },
    '',
)

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
