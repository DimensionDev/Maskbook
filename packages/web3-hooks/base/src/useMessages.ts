import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useMessages<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T) {
    const { Message } = useWeb3State(pluginID)
    return useSubscription(Message?.messages ?? EMPTY_ARRAY)
}
