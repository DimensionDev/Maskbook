import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID } from './Context'
import { useActivatedPluginWeb3UI } from '../hooks/useActivatedPluginWeb3UI'
import type { Web3Helper } from '../web3-helpers'

export function useWeb3UI<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID) as T
    return useActivatedPluginWeb3UI(pluginID) as Web3Helper.Web3UIScope<S, T>
}
