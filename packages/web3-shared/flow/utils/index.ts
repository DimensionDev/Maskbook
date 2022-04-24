import urlcat from 'urlcat'
import { createLookupTableResolver } from '@masknet/web3-shared-base'
import { ChainId, ProviderType } from '../types'
import { getChainConstants } from '../constants'

// #formatter
export function formatAddress(address: string, size = 0) {
    if (!/0x\w{16}/.test(address)) return address
    if (size === 0 || size >= 8) return address
    return `${address.substr(0, 2 + size)}...${address.substr(-size)}`
}

export function formatDomainName(domain?: string, size?: number) {
    return domain ?? ''
}
// #endregion

// #region validators
export function isChainIdValid(chainId: ChainId) {
    return false
}

export function isValidDomain(domain: string) {
    return false
}

export function isValidAddress(address: string) {
    return /0x\w{16}/.test(address)
}

export function isSameAddress(a?: string, b?: string) {
    if (!a || !b) return false
    return a.toLowerCase() === b.toLowerCase()
}
// #endregion

// #region pipes
const getExplorerURL = createLookupTableResolver<ChainId, string>(
    {
        [ChainId.Mainnet]: 'https://flowscan.org/',
        [ChainId.Testnet]: 'https://testnet.flowscan.org/',
    },
    '',
)

export function resolveTransactionLinkOnExplorer(chainId: ChainId, id: string) {
    return urlcat(getExplorerURL(chainId), '/transaction/:id', {
        id,
    })
}

export function resolveAddressLinkOnExplorer(chainId: ChainId, address: string) {
    return urlcat(getExplorerURL(chainId), '/account/:address', {
        address,
    })
}

export function resolveBlockLinkOnExplorer(chainId: ChainId, block: string) {
    return urlcat(getExplorerURL(chainId), '/block/:block', {
        block,
    })
}

export function resolveNonFungibleTokenLink(chainId: ChainId, address: string, tokenId: string) {
    return ''
}

export function resolveDomainLink(domain: string) {
    return ''
}

export function resolveChainColor(chainId: ChainId) {
    return getChainConstants(chainId).COLOR ?? '#34d399'
}

export function resolveChainFullName(chainId: ChainId) {
    const { NAME, FULL_NAME } = getChainConstants(chainId)
    return NAME ?? FULL_NAME ?? 'Flow'
}

export const resolveChainName = createLookupTableResolver<ChainId, string>(
    {
        [ChainId.Mainnet]: 'mainnet',
        [ChainId.Testnet]: 'testnet',
    },
    () => 'unknown',
)

export const resolveProviderName = createLookupTableResolver<ProviderType, string>(
    {
        [ProviderType.Blocto]: 'Blocto',
        [ProviderType.Dapper]: 'Dapper',
        [ProviderType.Ledger]: 'Ledger',
    },
    () => 'Unknown',
)
// #endregion
