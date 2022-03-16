import urlcat from 'urlcat'
import { createLookupTableResolver } from '@masknet/web3-shared-base'
import { ChainId, ProviderType } from '../types'

export const resolveChainName = createLookupTableResolver<ChainId, string>(
    {
        [ChainId.Mainnet]: 'mainnet',
        [ChainId.Testnet]: 'testnet',
        [ChainId.Devnet]: 'devnet',
    },
    () => 'Unknown chain id',
)

export const resolveProviderName = createLookupTableResolver<ProviderType, string>(
    {
        [ProviderType.Phantom]: 'Phantom',
        [ProviderType.Sollet]: 'Sollet',
    },
    () => 'Unknown provider type',
)

export const resolveLinkOnExplorer = createLookupTableResolver<ChainId, string>(
    {
        [ChainId.Mainnet]: 'https://explorer.solana.com/',
        [ChainId.Testnet]: 'https://explorer.solana.com/?cluster=testnet',
        [ChainId.Devnet]: 'https://explorer.solana.com/?cluster=devnet',
    },
    () => 'Unknown chain id',
)

export function resolveTransactionLinkOnExplorer(chainId: ChainId, tx: string) {
    return urlcat(resolveLinkOnExplorer(chainId), '/transaction/:tx', {
        tx,
    })
}

export function resolveAddressLinkOnExplorer(chainId: ChainId, address: string) {
    return urlcat(resolveLinkOnExplorer(chainId), '/account/:address', {
        address,
    })
}

export function resolveBlockLinkOnExplorer(chainId: ChainId, blockNumber: string) {
    return ''
}
