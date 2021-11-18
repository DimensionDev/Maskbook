import { useActivatedPluginDashboard, useActivatedPluginSNSAdaptor } from '..'

export function useActivatedPlugin(pluginID: string) {
    const pluginSNSAdaptor = useActivatedPluginSNSAdaptor(pluginID)
    const pluginDashboard = useActivatedPluginDashboard(pluginID)
    return pluginSNSAdaptor ?? pluginDashboard ?? null
}
