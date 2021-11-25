import type { Web3Plugin } from '@masknet/plugin-infra'
import {
    formatBalance,
    formatCurrency,
    formatEthereumAddress,
    getChainDetailed,
    isChainIdValid,
    isSameAddress,
    isValidAddress,
    NetworkType,
    PortfolioProvider,
    resolveAddressLinkOnExplorer,
    resolveBlockLinkOnExplorer,
    resolveChainColor,
    resolveChainFullName,
    resolveChainName,
    resolveTransactionLinkOnExplorer,
    Web3ProviderType,
} from '@masknet/web3-shared-evm'
import Ens from 'ethjs-ens'
import { getStorage, StorageDefaultValue } from '../../storage'
import { mapSubscription } from '@masknet/shared-base'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const ZERO_X_ERROR_ADDRESS = '0x'

export const Web3State: Web3Plugin.ObjectCapabilities.Capabilities = {}

function createSubscriptionFromEnsAddressBook<T>(getter: (value: typeof StorageDefaultValue.ensAddressBook) => T) {
    return mapSubscription(getStorage().ensAddressBook.subscription, getter)
}

export function fixWeb3State(state?: Web3Plugin.ObjectCapabilities.Capabilities, context?: Web3ProviderType) {
    if (!state || !context) return

    state.Shared = {
        ...(state.Shared ?? {
            allowTestnet: context.allowTestnet,
            chainId: context.chainId,
            account: context.account,
            balance: context.balance,
            blockNumber: context.blockNumber,
            networkType: context.networkType,
            providerType: context.providerType,
            walletPrimary: context.walletPrimary,
            wallets: context.wallets,
        }),
    }
    state.Asset = state.Asset ?? {
        getFungibleAssets: async (address, providerType, network, pagination) => {
            if (!network) return []
            const assets = await context.getAssetsList(
                address,
                providerType as unknown as PortfolioProvider,
                network.type as unknown as NetworkType,
            )
            return assets.map((x) => ({
                id: x.token.address,
                chainId: x.token.chainId,
                balance: x.balance,
                price: x.price,
                value: x.value,
                logoURI: x.logoURI,
                token: {
                    ...x.token,
                    id: x.token.address,
                    chainId: x.token.chainId,
                },
            }))
        },
    }
    state.NameService = state.NameService ?? {
        lookup: async (domain: string) => {
            // Only support Ethereum on evm
            if (context.networkType.getCurrentValue() !== NetworkType.Ethereum) return undefined

            const ensAddressBook = getStorage().ensAddressBook.value

            const cacheAddress = ensAddressBook[domain]
            if (cacheAddress) return cacheAddress

            const address = await new Ens({
                provider: context.provider.getCurrentValue(),
                network: context.chainId.getCurrentValue(),
            }).lookup(domain)

            if (isSameAddress(address, ZERO_ADDRESS) || isSameAddress(address, ZERO_X_ERROR_ADDRESS)) {
                return undefined
            }

            if (address)
                await getStorage().ensAddressBook.setValue({
                    ...ensAddressBook,
                    ...{ [address]: domain, [domain]: address },
                })

            return address
        },
        reverse: async (address: string) => {
            if (!isValidAddress(address)) return undefined
            const ensAddressBook = getStorage().ensAddressBook.value
            const cacheDomain = ensAddressBook[address]
            if (cacheDomain) return cacheDomain

            const domain = await new Ens({
                provider: context.provider.getCurrentValue(),
                network: context.chainId.getCurrentValue(),
            }).reverse(address)

            if (domain)
                await getStorage().ensAddressBook.setValue({
                    ...ensAddressBook,
                    ...{ [address]: domain, [domain]: address },
                })

            return domain
        },
    }
    state.Utils = state.Utils ?? {
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
    }
    return state
}
