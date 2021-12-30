import urlcat from 'urlcat'
import { createLookupTableResolver } from '@masknet/web3-kit'
import { ChainId, ProviderType } from '../types'

export const resolveChainName = createLookupTableResolver<ChainId, string>(
    {
        [ChainId.Mainnet]: 'mainnet',
        [ChainId.Testnet]: 'testnet',
    },
    () => 'Unknown chain id',
)

export const resolveProviderName = createLookupTableResolver<ProviderType, string>(
    {
        [ProviderType.Blocto]: 'Blocto',
        [ProviderType.Dapper]: 'Dapper',
        [ProviderType.Ledger]: 'Ledger',
    },
    () => 'Unknown provider type',
)

export const resolveLinkOnExplorer = createLookupTableResolver<ChainId, string>(
    {
        [ChainId.Mainnet]: 'https://flowscan.org/',
        [ChainId.Testnet]: 'https://testnet.flowscan.org/',
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
