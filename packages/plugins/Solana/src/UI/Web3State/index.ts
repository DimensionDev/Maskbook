import type { Web3Plugin } from '@masknet/plugin-infra'
import { createConstantSubscription, mapSubscription } from '@masknet/shared-base'
import {
    ChainId,
    NetworkType,
    ProviderType,
    resolveAddressLinkOnExplorer,
    resolveBlockLinkOnExplorer,
    resolveTransactionLinkOnExplorer,
} from '@masknet/web3-shared-solana'
import BigNumber from 'bignumber.js'
import { formatAddress } from '../../helpers'
import { getStorage, StorageDefaultValue } from '../../storage'

function createSubscriptionFromUser<T>(getter: (value: typeof StorageDefaultValue.publicKey) => T) {
    return mapSubscription(getStorage().publicKey.subscription, getter)
}

export function createWeb3State(signal: AbortSignal): Web3Plugin.ObjectCapabilities.Capabilities {
    const chainId = ChainId.Testnet

    return {
        Shared: {
            allowTestnet: createConstantSubscription(false),
            account: createSubscriptionFromUser((user) => {
                return user?.toString() ?? ''
            }),
            wallets: createSubscriptionFromUser((user): Web3Plugin.Wallet[] => {
                if (!user) return []
                return [
                    {
                        name: 'Solana',
                        address: user.toString(),
                        hasDerivationPath: false,
                        hasStoredKeyInfo: false,
                    },
                ]
            }),
            chainId: createConstantSubscription(chainId),
            networkType: createConstantSubscription(NetworkType.Solana),
            providerType: createSubscriptionFromUser((user) => {
                return user ? ProviderType.Sollet : undefined
            }),
        },
        Asset: {},
        Utils: {
            formatAddress,
            formatBalance: (value) => new BigNumber(value).toFixed(),
            formatCurrency: (value) => new BigNumber(value).toFixed(),

            isChainIdValid: () => true,

            resolveTransactionLink: resolveTransactionLinkOnExplorer,
            resolveAddressLink: resolveAddressLinkOnExplorer,
            resolveBlockLink: resolveBlockLinkOnExplorer,
        },
    }
}
