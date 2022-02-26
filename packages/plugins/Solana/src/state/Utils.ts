import type { Web3Plugin } from '@masknet/plugin-infra'
import { formatBalance } from '@masknet/web3-shared-evm'
import {
    isValidDomain,
    isValidAddress,
    isSameAddress,
    ChainId,
    formatCurrency,
    formatEthereumAddress,
    getChainDetailed,
    isChainIdValid,
    NonFungibleAssetProvider,
    resolveAddressLinkOnExplorer,
    resolveBlockLinkOnExplorer,
    resolveChainColor,
    resolveChainFullName,
    resolveChainName,
    resolveCollectibleLink,
    resolveTransactionLinkOnExplorer,
    resolveNonFungibleTokenLink,
    resolveDomainLink,
    formatDomainName,
} from '@masknet/web3-shared-solana'

export class Utils implements Web3Plugin.ObjectCapabilities.Others<ChainId> {
    isChainIdValid = isChainIdValid
    isValidDomain = isValidDomain
    isValidAddress = isValidAddress
    isSameAddress = isSameAddress

    getChainDetailed = getChainDetailed
    getAverageBlockDelay = (chainId: ChainId) => {
        return 15 * 1000
    }

    formatAddress = formatEthereumAddress
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
