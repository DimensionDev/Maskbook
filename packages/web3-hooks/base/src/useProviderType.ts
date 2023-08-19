import { useSubscription } from 'use-subscription'
import type { Web3Helper } from '@masknet/web3-helpers'
import { UNDEFINED, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useProviderType<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
) {
    const { Provider } = useWeb3State(pluginID)
    const defaultProviderType = useSubscription(Provider?.providerType ?? UNDEFINED)
    return defaultProviderType as Web3Helper.ProviderTypeScope<S, T>
}
