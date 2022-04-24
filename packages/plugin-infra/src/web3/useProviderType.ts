import { useSubscription } from 'use-subscription'
import { useWeb3State } from '../entry-web3'
import { UNDEIFNED } from '../utils/subscription'
import type { NetworkPluginID } from '../web3-types'

export function useProviderType<T extends NetworkPluginID>(pluginID?: T) {
    const { Provider } = useWeb3State(pluginID)
    // @ts-ignore
    return useSubscription(Provider?.providerType ?? UNDEIFNED)
}
