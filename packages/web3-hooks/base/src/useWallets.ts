import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EVM_Providers } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'

export function useWallets<T extends NetworkPluginID>(
    pluginID?: T,
    providerType?: Web3Helper.Definition[T]['ProviderType'],
) {
    // We got stored Mask wallets only.
    return useSubscription(EVM_Providers[ProviderType.MaskWallet].subscription.wallets ?? EMPTY_ARRAY)
}
