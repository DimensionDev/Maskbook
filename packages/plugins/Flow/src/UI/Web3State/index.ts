import type { Web3Plugin } from '@masknet/plugin-infra'
import {
    ChainId,
    NetworkType,
    ProviderType,
    resolveBlockLinkOnExplorer,
    resolveTransactionLinkOnExplorer,
    resolveAddressLinkOnExplorer,
} from '@masknet/web3-shared-flow'
import { createConstantSubscription, createSubscriptionFromScopedStorage } from '@masknet/shared-base'
import { formatAddress } from '../../helpers'
import { storage, StorageDefaultValue } from '../../storage'

function createSubscriptionFromUser<T>(getter: (value: typeof StorageDefaultValue.user) => T) {
    return createSubscriptionFromScopedStorage(
        storage,
        (storage) => {
            return getter(storage.storage.user.value)
        },
        (storage) => {
            return storage.storage.user.subscription.subscribe
        },
    )
}

function createWeb3State(): Web3Plugin.ObjectCapabilities.Capabilities {
    const chainId = ChainId.Testnet
    return {
        Shared: {
            allowTestnet: createConstantSubscription(false),
            account: createSubscriptionFromUser((user) => {
                return user?.addr ?? ''
            }),

            chainId: createConstantSubscription(chainId),
            networkType: createConstantSubscription(NetworkType.Flow),
            providerType: createSubscriptionFromUser((user) => {
                return user?.addr ? ProviderType.Blocto : undefined
            }),
        },
        Utils: {
            formatAddress,

            isChainIdValid: () => true,

            resolveTransactionLink: resolveTransactionLinkOnExplorer,
            resolveAddressLink: resolveAddressLinkOnExplorer,
            resolveBlockLink: resolveBlockLinkOnExplorer,
        },
    }
}

export const Web3State = createWeb3State()
