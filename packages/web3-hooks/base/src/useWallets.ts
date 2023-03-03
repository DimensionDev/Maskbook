import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useWallets<T extends NetworkPluginID>(
    pluginID?: T,
    providerType?: Web3Helper.Definition[T]['ProviderType'],
) {
    const { Wallet } = useWeb3State(pluginID)

    return useSubscription(Wallet?.wallets ?? EMPTY_ARRAY)
}
