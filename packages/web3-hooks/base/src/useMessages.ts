import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useDebugValue } from 'react'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'

export function useMessages<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T) {
    const { Message } = useWeb3State(pluginID)
    const m = useSubscriptionMaybe(Message?.messages, EMPTY_LIST)
    useDebugValue(m)
    return m
}
