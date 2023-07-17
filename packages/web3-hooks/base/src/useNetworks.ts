import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useNetworks<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T) {
    const { Network } = useWeb3State(pluginID)
    return useSubscription(Network?.networks ?? EMPTY_ARRAY)
}
