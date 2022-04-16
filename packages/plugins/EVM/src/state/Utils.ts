import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import {
    isValidDomain,
    isValidAddress,
    isSameAddress,
    ChainId,
    formatBalance,
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
    resolveDomainLink,
    formatDomainName,
} from '@masknet/web3-shared-evm'

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
    resolveNonFungibleTokenLink = (chainId: ChainId, address: string, tokenId: string) =>
        resolveCollectibleLink(chainId as ChainId, NonFungibleAssetProvider.OPENSEA, {
            // @ts-ignore
            contractDetailed: { address },
            tokenId,
        })
}
