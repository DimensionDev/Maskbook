import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY, type NetworkPluginID } from '@masknet/shared-base'
import { Providers } from '@masknet/web3-providers'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ProviderType } from '@masknet/web3-shared-evm'

export function useWallets<T extends NetworkPluginID>(
    pluginID?: T,
    providerType?: Web3Helper.Definition[T]['ProviderType'],
) {
    // We got stored Mask wallets only.
    return useSubscription(Providers[ProviderType.MaskWallet].subscription.wallets ?? EMPTY_ARRAY)
}
