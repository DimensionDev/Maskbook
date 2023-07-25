import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useRequests<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T) {
    const { Request } = useWeb3State(pluginID)
    return useSubscription(Request?.requests ?? EMPTY_ARRAY)
}
