import { useActivatedPluginDashboard } from '../manager/dashboard.js'
import { useActivatedPluginSiteAdaptor } from '../manager/site-adaptor.js'

export function useActivatedPlugin(pluginID: string, minimalModeEqualsTo: 'any' | boolean) {
    const pluginSNSAdaptor = useActivatedPluginSiteAdaptor(pluginID, minimalModeEqualsTo)
    const pluginDashboard = useActivatedPluginDashboard(pluginID)
    return pluginSNSAdaptor ?? pluginDashboard ?? null
}
