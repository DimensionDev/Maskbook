import { createInjectHooksRenderer } from './createInjectHooksRenderer.js'
import { useActivatedPluginsSNSAdaptor } from '../manager/sns-adaptor.js'

export function getProfileTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
        const tab = x.ProfileTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

export function getSettingsTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
        const tab = x.SettingTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}
