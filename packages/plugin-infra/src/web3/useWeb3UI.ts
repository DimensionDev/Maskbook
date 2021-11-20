import { usePluginIDContext } from './Context'
import { useActivatedPluginWeb3UI } from '../hooks/useActivatedPluginWeb3UI'
import type { NetworkPluginID } from '..'

export function useWeb3UI(expectedPluginID?: NetworkPluginID) {
    const pluginID = usePluginIDContext()
    return useActivatedPluginWeb3UI(expectedPluginID ?? pluginID) ?? {}
}
