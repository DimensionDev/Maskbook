import { usePluginIDContext } from './Context'
import { useActivatedPluginWeb3UI } from '../hooks/useActivatedPluginWeb3UI'

export function useWeb3UI(expectedPluginID?: string) {
    const pluginID = usePluginIDContext()
    return useActivatedPluginWeb3UI(expectedPluginID ?? pluginID) ?? {}
}
