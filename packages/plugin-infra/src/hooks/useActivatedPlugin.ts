import { useActivatedPluginDashboard } from '../manager/dashboard'
import { useActivatedPluginSNSAdaptor } from '../manager/sns-adaptor'

export function useActivatedPlugin(pluginID: string, minimalModeEqualsTo: 'any' | boolean) {
    const pluginSNSAdaptor = useActivatedPluginSNSAdaptor(pluginID, minimalModeEqualsTo)
    const pluginDashboard = useActivatedPluginDashboard(pluginID)
    return pluginSNSAdaptor ?? pluginDashboard ?? null
}
