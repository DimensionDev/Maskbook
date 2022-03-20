import type { Web3Plugin } from '@masknet/plugin-infra'
import {
    ChainId,
    formatBalance,
    formatCurrency,
    formatEthereumAddress,
    getChainDetailed,
    isSameAddress,
    isChainIdValid,
    NetworkType,
    NonFungibleAssetProvider,
    resolveAddressLinkOnExplorer,
    resolveBlockLinkOnExplorer,
    resolveChainColor,
    resolveChainFullName,
    resolveChainName,
    resolveCollectibleLink,
    resolveTransactionLinkOnExplorer,
    isValidDomain,
    resolveDomainLink,
    formatDomainName,
    ProviderType,
    ChainOptions,
} from '@masknet/web3-shared-evm'
import {
    createConstantSubscription,
    getEnhanceableSiteType,
    getExtensionSiteType,
    mapSubscription,
} from '@masknet/shared-base'
import { getMemory } from '../../storage'
import { EVM_RPC } from '../../messages'

function createSubscriptionFromChainOptions<T>(getter: (value: ChainOptions | undefined) => T) {
    const enhanceableSiteType = getEnhanceableSiteType()
    const extensionSiteType = getExtensionSiteType()
    return mapSubscription(getMemory().chainOptions.subscription, (chainOptions) => {
        return getter(
            enhanceableSiteType
                ? chainOptions[enhanceableSiteType]
                : extensionSiteType
                ? chainOptions[extensionSiteType]
                : undefined,
        )
    })
}

export function creatWeb3State(signal: AbortSignal): Web3Plugin.ObjectCapabilities.Capabilities {
    return {
        Shared: {
            allowTestnet: createConstantSubscription(process.env.NODE_ENV === 'development'),
            account: createSubscriptionFromChainOptions((chainOptions) => chainOptions?.account ?? ''),
            chainId: createSubscriptionFromChainOptions((chainOptions) => chainOptions?.chainId ?? ChainId.Mainnet),
            networkType: createSubscriptionFromChainOptions(
                (chainOptions) => chainOptions?.networkType ?? NetworkType.Ethereum,
            ),
            providerType: createSubscriptionFromChainOptions(
                (chainOptions) => chainOptions?.providerType ?? ProviderType.MaskWallet,
            ),
        },
        NameService: {
            lookup: EVM_RPC.lookup,
            reverse: EVM_RPC.reverse,
        },
        Asset: {
            getFungibleAssets: EVM_RPC.getFungibleAssetsFn,
            getNonFungibleAssets: EVM_RPC.getNonFungibleTokenFn,
        },
        Utils: {
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
        },
    }
}
