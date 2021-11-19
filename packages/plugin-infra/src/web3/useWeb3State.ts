import { usePluginIDContext } from './Context'
import { useActivatedPluginWeb3State } from '../hooks/useActivatedPluginWeb3State'

export function useWeb3State(expectedPluginID?: string) {
    const pluginID = usePluginIDContext()
    return useActivatedPluginWeb3State(expectedPluginID ?? pluginID) ?? {}
}
