import { useActivatedPluginDashboard } from '../manager/dashboard'
import { useActivatedPluginSNSAdaptor } from '../manager/sns-adaptor'

export function useActivatedPlugin(pluginID: string) {
    const pluginSNSAdaptor = useActivatedPluginSNSAdaptor(pluginID)
    const pluginDashboard = useActivatedPluginDashboard(pluginID)
    return pluginSNSAdaptor ?? pluginDashboard ?? null
}
