import { usePluginIDContext } from '.'
import { useActivatedPluginWeb3State } from '..'

export function useWeb3State(expectedPluginID?: string) {
    const pluginID = usePluginIDContext()
    return useActivatedPluginWeb3State(expectedPluginID ?? pluginID) ?? {}
}
