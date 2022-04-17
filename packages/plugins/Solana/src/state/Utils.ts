import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { formatBalance, formatCurrency, formatDomainName } from '@masknet/web3-shared-evm'
import {
    isValidDomain,
    isValidAddress,
    isSameAddress,
    ChainId,
    formatAddress,
    getChainDetailed,
    isChainIdValid,
    resolveAddressLinkOnExplorer,
    resolveBlockLinkOnExplorer,
    resolveChainColor,
    resolveChainFullName,
    resolveChainName,
    resolveTransactionLinkOnExplorer,
    resolveFungileTokenLink,
    resolveNonFungibleTokenLink,
    resolveDomainLink,
} from '@masknet/web3-shared-solana'

export class Utils implements Web3Plugin.ObjectCapabilities.Others<ChainId> {
    isChainIdValid = isChainIdValid
    isValidDomain = isValidDomain
    isValidAddress = isValidAddress
    isSameAddress = isSameAddress

    formatAddress = formatAddress
    formatCurrency = formatCurrency
    formatBalance = formatBalance
    formatDomainName = formatDomainName

    getChainDetailed = getChainDetailed
    getAverageBlockDelay = (chainId: ChainId) => {
        return 15 * 1000
    }

    resolveChainName = resolveChainName
    resolveChainFullName = resolveChainFullName
    resolveChainColor = resolveChainColor

    resolveTransactionLink = resolveTransactionLinkOnExplorer
    resolveAddressLink = resolveAddressLinkOnExplorer
    resolveBlockLink = resolveBlockLinkOnExplorer
    resolveDomainLink = resolveDomainLink
    resolveFungileTokenLink = resolveFungileTokenLink
    resolveNonFungibleTokenLink = resolveNonFungibleTokenLink
}
