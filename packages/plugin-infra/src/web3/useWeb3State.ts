import { usePluginIDContext } from './Context'
import { useActivatedPluginWeb3State } from '../hooks/useActivatedPluginWeb3State'
import type { NetworkPluginID } from '..'

export function useWeb3State(expectedPluginID?: NetworkPluginID) {
    const pluginID = usePluginIDContext()
    return useActivatedPluginWeb3State(expectedPluginID ?? pluginID) ?? {}
}
