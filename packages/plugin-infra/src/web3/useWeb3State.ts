import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID } from './Context'
import { useActivatedPluginWeb3State } from '../hooks/useActivatedPluginWeb3State'
import type { Web3Helper } from '../web3-helpers'

export function useWeb3State<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID) as T
    return useActivatedPluginWeb3State(pluginID) as Web3Helper.Web3StateScope<S, T>
}
