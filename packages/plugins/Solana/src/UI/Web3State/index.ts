import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { createConstantSubscription, mapSubscription } from '@masknet/shared-base'
import { toFixed } from '@masknet/web3-shared-base'
import {
    ChainId,
    NetworkType,
    ProviderType,
    resolveAddressLinkOnExplorer,
    resolveBlockLinkOnExplorer,
    resolveTransactionLinkOnExplorer,
    resolveNetworkName,
    resolveProviderName,
    resolveChainIdFromNetworkType,
    resolveProviderShortenLink,
    resolveProviderHomeLink,
} from '@masknet/web3-shared-solana'
import { getFungibleAssets, getNonFungibleAssets, lookup, reverse } from '../../apis'
import { formatAddress, formatCurrency } from '../../helpers'
import { getStorage, StorageDefaultValue } from '../../storage'

function createSubscriptionFromPublicKey<T>(getter: (value: typeof StorageDefaultValue.publicKey) => T) {
    return mapSubscription(getStorage().publicKey.subscription, getter)
}

export function createWeb3State(signal: AbortSignal): Web3Plugin.ObjectCapabilities.Capabilities {
    const chainId = ChainId.Mainnet

    return {
        Shared: {
            allowTestnet: createConstantSubscription(false),
            account: createSubscriptionFromPublicKey((publicKey) => {
                return publicKey ?? ''
            }),
            wallets: createSubscriptionFromPublicKey((publicKey): Web3Plugin.Wallet[] => {
                if (!publicKey) return []
                return [
                    {
                        name: 'Solana',
                        address: publicKey,
                        hasDerivationPath: false,
                        hasStoredKeyInfo: false,
                    },
                ]
            }),
            chainId: createConstantSubscription(chainId),
            networkType: createConstantSubscription(NetworkType.Solana),
            providerType: createSubscriptionFromPublicKey((publicKey) => {
                return publicKey ? ProviderType.Phantom : undefined
            }),
        },
        Asset: {
            getFungibleAssets,
            getNonFungibleAssets,
        },
        Utils: {
            formatAddress,
            formatBalance: toFixed,
            formatCurrency,

            isChainIdValid: () => true,

            resolveChainIdFromNetworkType,
            resolveTransactionLink: resolveTransactionLinkOnExplorer,
            resolveAddressLink: resolveAddressLinkOnExplorer,
            resolveBlockLink: resolveBlockLinkOnExplorer,
            resolveProviderShortenLink,
            resolveProviderHomeLink,
            resolveNetworkName,
            resolveProviderName,
        },
        NameService: {
            lookup: (domain: string) => lookup(domain, chainId),
            reverse: (address: string) => reverse(address, chainId),
        },
    }
}
