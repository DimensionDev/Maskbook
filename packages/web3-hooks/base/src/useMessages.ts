import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useDebugValue } from 'react'

export function useMessages<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T) {
    const { Message } = useWeb3State(pluginID)
    const m = useSubscription(Message?.messages ?? EMPTY_ARRAY)
    useDebugValue(m)
    return m
}
