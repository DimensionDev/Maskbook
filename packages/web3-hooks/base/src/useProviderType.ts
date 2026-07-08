import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'

export function useProviderType<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
) {
    const { Provider } = useWeb3State(pluginID)
    const defaultProviderType = useSubscriptionMaybe(Provider?.providerType, undefined)
    return defaultProviderType as Web3Helper.ProviderTypeScope<S, T>
}
