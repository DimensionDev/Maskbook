import { useActivatedPluginDashboard } from '../manager/dashboard.js'
import { useActivatedPluginSNSAdaptor } from '../manager/sns-adaptor.js'

export function useActivatedPlugin(pluginID: string, minimalModeEqualsTo: 'any' | boolean) {
    const pluginSNSAdaptor = useActivatedPluginSNSAdaptor(pluginID, minimalModeEqualsTo)
    const pluginDashboard = useActivatedPluginDashboard(pluginID)
    return pluginSNSAdaptor ?? pluginDashboard ?? null
}
