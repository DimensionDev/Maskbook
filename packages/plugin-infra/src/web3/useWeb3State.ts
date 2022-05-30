import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID } from './Context'
import { useActivatedPluginWeb3State } from '../hooks/useActivatedPluginWeb3State'

export function useWeb3State<T extends NetworkPluginID>(expectedPluginID?: T) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID) as T
    return useActivatedPluginWeb3State(pluginID)
}
