import urlcat from 'urlcat'
import { createLookupTableResolver } from '@masknet/web3-kit'
import { ChainId, ProviderType } from '../types'

export const resolveChainName = createLookupTableResolver<ChainId, string>(
    {
        [ChainId.ColumbusMainnet]: 'columbus',
        [ChainId.SojuTestnet]: 'soju',
        [ChainId.VodkaTestnet]: 'vodka',
    },
    () => 'Unknown chain id',
)

export const resolveProviderName = createLookupTableResolver<ProviderType, string>(
    {
        [ProviderType.TerraStation]: 'TerraStation',
    },
    () => 'Unknown provider type',
)

export const resolveLinkOnExplorer = createLookupTableResolver<ChainId, string>(
    {
        [ChainId.ColumbusMainnet]: 'https://finder.terra.money/mainnet/',
        [ChainId.SojuTestnet]: 'https://finder.terra.money/testnet/',
        [ChainId.VodkaTestnet]: 'https://finder.terra.money/testnet/',
    },
    () => 'Unknown chain id',
)

export function resolveTransactionLinkOnExplorer(chainId: ChainId, tx: string) {
    return urlcat(resolveLinkOnExplorer(chainId), '/tx/:tx', {
        tx,
    })
}

export function resolveAddressLinkOnExplorer(chainId: ChainId, address: string) {
    return urlcat(resolveLinkOnExplorer(chainId), '/address/:address', {
        address,
    })
}

export function resolveBlockLinkOnExplorer(chainId: ChainId, blockNumber: string) {
    return ''
}
