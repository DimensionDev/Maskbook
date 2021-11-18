import { usePluginIDContext } from '.'
import { useActivatedPluginWeb3UI } from '..'

export function useWeb3UI(expectedPluginID?: string) {
    const pluginID = usePluginIDContext()
    return useActivatedPluginWeb3UI(expectedPluginID ?? pluginID) ?? {}
}
