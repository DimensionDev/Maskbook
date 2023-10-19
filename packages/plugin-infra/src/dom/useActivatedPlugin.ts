import { useActivatedPluginExtensionPage } from '../manager/extension-page.js'
import { useActivatedPluginSiteAdaptor } from '../manager/site-adaptor.js'

export function useActivatedPlugin(pluginID: string, minimalModeEqualsTo: 'any' | boolean) {
    const pluginSiteAdaptor = useActivatedPluginSiteAdaptor(pluginID, minimalModeEqualsTo)
    const pluginExtensionPage = useActivatedPluginExtensionPage(pluginID)
    return pluginSiteAdaptor ?? pluginExtensionPage ?? null
}
