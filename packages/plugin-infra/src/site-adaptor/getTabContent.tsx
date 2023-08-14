import type { Web3Helper } from '@masknet/web3-helpers'
import type { SearchResult } from '@masknet/web3-shared-base'
import { createInjectHooksRenderer } from '../dom/createInjectHooksRenderer.js'
import { useActivatedPluginsSiteAdaptor } from '../manager/site-adaptor.js'

export function getProfileTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode, (x) => {
        const tab = x.ProfileTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

export function getProfileCardTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode, (x) => {
        const tab = x.ProfileCardTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

export function getSettingsTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode, (x) => {
        const tab = x.SettingTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

export function getSearchResultContent(result: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>) {
    return createInjectHooksRenderer(useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode, (x) => {
        const shouldDisplay = x.SearchResultInspector?.Utils?.shouldDisplay?.(result) ?? true
        return shouldDisplay ? x.SearchResultInspector?.UI?.Content : undefined
    })
}

export function getSearchResultContentForProfileTab(
    result: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
) {
    return createInjectHooksRenderer(useActivatedPluginsSiteAdaptor.visibility.useAnyMode, (x) => {
        const shouldDisplay = x.SearchResultInspector?.Utils?.shouldDisplay?.(result) ?? true
        return shouldDisplay ? x.SearchResultInspector?.UI?.Content : undefined
    })
}

export function getSearchResultTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode, (x) => {
        const tab = x.SearchResultTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}
