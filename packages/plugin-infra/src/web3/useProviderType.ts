import { Subscription, useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { UNDEFINED } from '../utils/subscription'
import { useCurrentWeb3NetworkProviderType } from './Context'

export function useProviderType<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
) {
    type Result = S extends 'all' ? Web3Helper.ProviderTypeAll : Web3Helper.Definition[T]['ProviderType']

    const { Provider } = useWeb3State(pluginID)
    const currentProviderType = useCurrentWeb3NetworkProviderType(pluginID)
    const providerType = useSubscription(
        (Provider?.providerType ?? UNDEFINED) as Subscription<Web3Helper.Definition[T]['ProviderType'] | undefined>,
    )

    return (currentProviderType ?? providerType) as Result
}
