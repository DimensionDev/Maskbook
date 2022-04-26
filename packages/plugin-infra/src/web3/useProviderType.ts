import { Subscription, useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { UNDEIFNED } from '../utils/subscription'

export function useProviderType<T extends NetworkPluginID, ProviderType = Web3Helper.Definition[T]['ProviderType']>(
    pluginID?: T,
) {
    const { Provider } = useWeb3State(pluginID)
    return useSubscription((Provider?.providerType ?? UNDEIFNED) as Subscription<ProviderType | undefined>)
}
