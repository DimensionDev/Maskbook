import { useCurrentWeb3NetworkPluginID } from './Context'
import { useActivatedPluginWeb3State } from '../hooks/useActivatedPluginWeb3State'
import type { NetworkPluginID } from '../web3-types'

export function useWeb3State(expectedPluginID?: NetworkPluginID) {
    const pluginID = useCurrentWeb3NetworkPluginID()
    return useActivatedPluginWeb3State(expectedPluginID ?? pluginID) ?? {}
}
