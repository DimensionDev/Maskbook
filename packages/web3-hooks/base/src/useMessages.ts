import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useDebugValue } from 'react'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'
import type { ReasonableMessage } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useMessages<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
): Array<ReasonableMessage<Web3Helper.Definition[T]['MessageRequest'], Web3Helper.Definition[T]['MessageResponse']>> {
    const { Message } = useWeb3State(pluginID)
    const m = useSubscriptionMaybe(Message?.messages, EMPTY_LIST)
    useDebugValue(m)
    return m
}
