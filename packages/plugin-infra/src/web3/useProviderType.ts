import { Subscription, useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { UNDEFINED } from '../utils/subscription'
import { useCurrentWeb3NetworkProviderType } from './Context'

export function useProviderType<T extends NetworkPluginID>(pluginID?: T) {
    const { Provider } = useWeb3State(pluginID)
    const currentProviderType = useCurrentWeb3NetworkProviderType(pluginID)
    const providerType = useSubscription(
        (Provider?.providerType ?? UNDEFINED) as Subscription<Web3Helper.Definition[T]['ProviderType'] | undefined>,
    )

    return currentProviderType ?? providerType
}
