import type { Web3Plugin } from '@masknet/plugin-infra'
import {
    isValidDomain,
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
import { EVM_RPC } from '../../../messages'

export async function createUtilsState(): Promise<Web3Plugin.ObjectCapabilities.Others> {
    return {
        isValidDomain,
        isSameAddress,

        getLatestBalance: (chainId: ChainId, account: string) => {
            return EVM_RPC.getBalance(account, {
                chainId,
            })
        },
        getLatestBlockNumber: (chainId: ChainId) => {
            return EVM_RPC.getBlockNumber({
                chainId,
            })
        },

        getChainDetailed,
        isChainIdValid,

        formatAddress: formatEthereumAddress,
        formatCurrency,
        formatBalance,

        resolveChainName,
        resolveChainFullName,
        resolveChainColor,

        resolveTransactionLink: resolveTransactionLinkOnExplorer,
        resolveAddressLink: resolveAddressLinkOnExplorer,
        resolveBlockLink: resolveBlockLinkOnExplorer,

        resolveDomainLink,
        formatDomainName,

        resolveNonFungibleTokenLink: (chainId: ChainId, address: string, tokenId: string) =>
            resolveCollectibleLink(chainId as ChainId, NonFungibleAssetProvider.OPENSEA, {
                contractDetailed: { address: address },
                tokenId: tokenId,
            } as unknown as any),
    }
}
