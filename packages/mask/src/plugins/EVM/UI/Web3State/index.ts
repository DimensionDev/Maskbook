import Ens from 'ethjs-ens'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import {
    ChainId,
    formatBalance,
    formatCurrency,
    formatEthereumAddress,
    getChainDetailed,
    resolveChainIdFromNetworkType,
    isChainIdValid,
    isSameAddress,
    isValidAddress,
    NetworkType,
    NonFungibleAssetProvider,
    resolveAddressLinkOnExplorer,
    resolveBlockLinkOnExplorer,
    resolveChainColor,
    resolveChainFullName,
    resolveChainName,
    resolveCollectibleLink,
    resolveTransactionLinkOnExplorer,
    Web3ProviderType,
    isValidDomain,
    resolveDomainLink,
    formatDomainName,
    isZeroAddress,
    createWeb3,
    createExternalProvider,
    resolveNetworkName,
    resolveProviderName,
} from '@masknet/web3-shared-evm'
import { getStorage } from '../../storage'

import { getFungibleAssetsFn, getNonFungibleTokenFn } from './getAssetsFn'
import { createGetLatestBalance } from './createGetLatestBalance'
const ZERO_X_ERROR_ADDRESS = '0x'

export function fixWeb3State(state?: Web3Plugin.ObjectCapabilities.Capabilities, context?: Web3ProviderType) {
    if (!state || !context) return

    state.Shared = state.Shared ?? {
        allowTestnet: context.allowTestnet,
        chainId: context.chainId,
        account: context.account,
        networkType: context.networkType,
        providerType: context.providerType,
        walletPrimary: context.walletPrimary,
        wallets: context.wallets,
    }
    state.Asset = state.Asset ?? {
        getFungibleAssets: getFungibleAssetsFn(context),
        getNonFungibleAssets: getNonFungibleTokenFn(context),
    }
    state.NameService = state.NameService ?? {
        lookup: async (domain: string) => {
            const chainId = context.chainId.getCurrentValue()
            const network = context.networkType.getCurrentValue()

            // Only support Ethereum on evm
            if (network !== NetworkType.Ethereum) return undefined

            const domainAddressBook = getStorage().domainAddressBook.value

            const cacheAddress = domainAddressBook[chainId]?.[domain]
            if (cacheAddress && isValidAddress(cacheAddress)) return cacheAddress

            const address = await new Ens({
                provider: createExternalProvider(context.request, context.getSendOverrides, context.getRequestOptions),
                network: chainId,
            }).lookup(domain)

            if (isZeroAddress(address) || isSameAddress(address, ZERO_X_ERROR_ADDRESS) || !isValidAddress(address)) {
                return undefined
            }

            if (address)
                await getStorage().domainAddressBook.setValue({
                    ...domainAddressBook,
                    [chainId]: {
                        ...domainAddressBook[chainId],
                        ...{ [address]: domain, [domain]: address },
                    },
                })

            return address
        },
        reverse: async (address: string) => {
            if (!isValidAddress(address)) return undefined
            const chainId = context.chainId.getCurrentValue()
            const network = context.networkType.getCurrentValue()

            // Only support Ethereum on evm
            if (network !== NetworkType.Ethereum) return undefined

            const domainAddressBook = getStorage().domainAddressBook.value
            const cacheDomain = domainAddressBook[chainId]?.[address]
            if (cacheDomain) return cacheDomain

            try {
                const domain = await new Ens({
                    provider: createExternalProvider(
                        context.request,
                        context.getSendOverrides,
                        context.getRequestOptions,
                    ),
                    network: chainId,
                }).reverse(address)

                if (isZeroAddress(domain) || isSameAddress(domain, ZERO_X_ERROR_ADDRESS)) {
                    return undefined
                }

                if (domain)
                    await getStorage().domainAddressBook.setValue({
                        ...domainAddressBook,
                        [chainId]: {
                            ...domainAddressBook[chainId],
                            ...{ [address]: domain, [domain]: address },
                        },
                    })

                return domain
            } catch {
                return undefined
            }
        },
    }
    state.Utils = state.Utils ?? {
        getLatestBalance: createGetLatestBalance(context),
        getLatestBlockNumber: (chainId: ChainId) => {
            const web3 = createWeb3(context.request, () => ({
                chainId,
            }))
            return web3.eth.getBlockNumber()
        },

        getChainDetailed,
        isChainIdValid,

        formatAddress: formatEthereumAddress,
        formatCurrency,
        formatBalance,

        resolveChainIdFromNetworkType,

        resolveChainName,
        resolveProviderName,
        resolveChainFullName,
        resolveChainColor,
        resolveNetworkName,

        resolveTransactionLink: resolveTransactionLinkOnExplorer,
        resolveAddressLink: resolveAddressLinkOnExplorer,
        resolveBlockLink: resolveBlockLinkOnExplorer,
        isValidDomain,
        resolveDomainLink,
        formatDomainName,
        resolveNonFungibleTokenLink: (chainId: ChainId, address: string, tokenId: string) =>
            resolveCollectibleLink(chainId as ChainId, NonFungibleAssetProvider.OPENSEA, {
                contractDetailed: { address },
                tokenId,
            } as unknown as any),
    }
    return state
}
