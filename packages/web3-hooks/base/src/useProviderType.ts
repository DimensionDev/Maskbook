import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { UNDEFINED } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useCurrentWeb3NetworkProviderType } from './useContext.js'

export function useProviderType<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
) {
    const { Provider } = useWeb3State(pluginID)
    const currentProviderType = useCurrentWeb3NetworkProviderType(pluginID)
    const defaultProviderType = useSubscription(Provider?.providerType ?? UNDEFINED)
    return (currentProviderType ?? defaultProviderType) as Web3Helper.ProviderTypeScope<S, T>
}

export function useActualProviderType<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
) {
    const { Provider } = useWeb3State(pluginID)
    const defaultProviderType = useSubscription(Provider?.providerType ?? UNDEFINED)
    return defaultProviderType as Web3Helper.ProviderTypeScope<S, T>
}
