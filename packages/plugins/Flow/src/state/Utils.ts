import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { formatBalance, formatCurrency } from '@masknet/web3-shared-evm'
import {
    isValidDomain,
    isValidAddress,
    isSameAddress,
    ChainId,
    formatAddress,
    getChainDetailed,
    isChainIdValid,
    resolveNonFungibleTokenLink,
    resolveAddressLinkOnExplorer,
    resolveBlockLinkOnExplorer,
    resolveChainColor,
    resolveChainFullName,
    resolveChainName,
    resolveTransactionLinkOnExplorer,
    resolveDomainLink,
    formatDomainName,
} from '@masknet/web3-shared-flow'

export class Utils implements Web3Plugin.ObjectCapabilities.Others<ChainId> {
    isChainIdValid = isChainIdValid
    isValidDomain = isValidDomain
    isValidAddress = isValidAddress
    isSameAddress = isSameAddress

    getChainDetailed = getChainDetailed
    getAverageBlockDelay = (chainId: ChainId) => {
        return 1 * 1000
    }

    formatAddress = formatAddress
    formatCurrency = formatCurrency
    formatBalance = formatBalance
    formatDomainName = formatDomainName

    resolveChainName = resolveChainName
    resolveChainFullName = resolveChainFullName
    resolveChainColor = resolveChainColor

    resolveTransactionLink = resolveTransactionLinkOnExplorer
    resolveAddressLink = resolveAddressLinkOnExplorer
    resolveBlockLink = resolveBlockLinkOnExplorer
    resolveDomainLink = resolveDomainLink
    resolveNonFungibleTokenLink = resolveNonFungibleTokenLink
}
