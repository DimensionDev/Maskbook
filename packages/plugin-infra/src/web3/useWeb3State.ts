import { useCurrentWeb3NetworkPluginID } from './Context'
import { useActivatedPluginWeb3State } from '../hooks/useActivatedPluginWeb3State'
import type { NetworkPluginID } from '../web3-types'

export function useWeb3State<T extends NetworkPluginID>(expectedPluginID?: T) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID) as T
    return useActivatedPluginWeb3State(pluginID)
}
