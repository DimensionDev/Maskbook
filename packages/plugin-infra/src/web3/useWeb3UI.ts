import { useCurrentWeb3NetworkPluginID } from './Context'
import { useActivatedPluginWeb3UI } from '../hooks/useActivatedPluginWeb3UI'
import type { NetworkPluginID } from '../web3-types'

export function useWeb3UI<T extends NetworkPluginID>(expectedPluginID?: T) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    return useActivatedPluginWeb3UI(pluginID)
}
