import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { useWalletProvider } from './useWalletProvider.js'

export function useWallets<T extends NetworkPluginID>(
    pluginID?: T,
    providerType?: Web3Helper.Definition[T]['ProviderType'],
) {
    // We got stored Mask wallets only.
    const walletProvider = useWalletProvider(NetworkPluginID.PLUGIN_EVM, ProviderType.MaskWallet)
    return useSubscription(walletProvider?.subscription.wallets ?? EMPTY_ARRAY)
}
