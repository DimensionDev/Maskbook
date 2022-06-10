import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { UNDEFINED } from '../utils/subscription'
import { useCurrentWeb3NetworkProviderType } from './Context'

export function useProviderType<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
) {
    const { Provider } = useWeb3State(pluginID)
    const currentProviderType = useCurrentWeb3NetworkProviderType(pluginID)
    const providerType = useSubscription(Provider?.providerType ?? UNDEFINED)
    return (currentProviderType ?? providerType) as Web3Helper.ProviderTypeScope<S, T>
}
