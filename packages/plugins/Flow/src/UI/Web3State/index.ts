import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import {
    NetworkType,
    ProviderType,
    resolveBlockLinkOnExplorer,
    resolveTransactionLinkOnExplorer,
    resolveAddressLinkOnExplorer,
} from '@masknet/web3-shared-flow'
import { createConstantSubscription, mapSubscription } from '@masknet/shared-base'
import { toFixed } from '@masknet/web3-shared-base'
import { getStorage, StorageDefaultValue } from '../../storage'
import { formatAddress } from '../../helpers'
import { getFungibleAssets } from '../../apis'

function createSubscriptionFromChainId<T>(getter: (value: typeof StorageDefaultValue.chainId) => T) {
    return mapSubscription(getStorage().chainId.subscription, getter)
}

function createSubscriptionFromUser<T>(getter: (value: typeof StorageDefaultValue.user) => T) {
    return mapSubscription(getStorage().user.subscription, getter)
}

export function createWeb3State(signal: AbortSignal): Web3Plugin.ObjectCapabilities.Capabilities {
    return {
        Shared: {
            allowTestnet: createConstantSubscription(false),
            account: createSubscriptionFromUser((user) => {
                return user?.addr ?? ''
            }),
            wallets: createSubscriptionFromUser((user): Web3Plugin.Wallet[] => {
                if (!user?.addr) return []

                const now = new Date()
                const address = user?.addr ?? ''

                return [
                    {
                        id: address,
                        name: 'Flow',
                        address,
                        hasDerivationPath: false,
                        hasStoredKeyInfo: false,
                        createdAt: now,
                        updatedAt: now,
                    },
                ]
            }),
            chainId: createSubscriptionFromChainId((x) => x as unknown as number),
            networkType: createConstantSubscription(NetworkType.Flow),
            providerType: createSubscriptionFromUser((user) => {
                return user?.addr ? ProviderType.Blocto : undefined
            }),
        },
        Utils: {
            formatAddress,
            formatBalance: toFixed,
            formatCurrency: (value, sign = '') => `${sign}${toFixed(value)}`,

            isChainIdValid: () => true,

            resolveTransactionLink: resolveTransactionLinkOnExplorer,
            resolveAddressLink: resolveAddressLinkOnExplorer,
            resolveBlockLink: resolveBlockLinkOnExplorer,
        },
    }
}
