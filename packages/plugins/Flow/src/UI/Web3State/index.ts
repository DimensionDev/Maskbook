import BigNumber from 'bignumber.js'
import type { Web3Plugin } from '@masknet/plugin-infra'
import {
    ChainId,
    NetworkType,
    ProviderType,
    resolveBlockLinkOnExplorer,
    resolveTransactionLinkOnExplorer,
    resolveAddressLinkOnExplorer,
} from '@masknet/web3-shared-flow'
import { createConstantSubscription, mapSubscription } from '@masknet/shared-base'
import { getStorage, StorageDefaultValue } from '../../storage'
import { formatAddress } from '../../helpers'
import { getFungibleAssets } from '../../apis'

function createSubscriptionFromUser<T>(getter: (value: typeof StorageDefaultValue.user) => T) {
    return mapSubscription(getStorage().user.subscription, getter)
}

export function createWeb3State(signal: AbortSignal): Web3Plugin.ObjectCapabilities.Capabilities {
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
        Asset: {
            getFungibleAssets,
        },
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
