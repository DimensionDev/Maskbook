import { createInjectHooksRenderer } from '../dom/createInjectHooksRenderer.js'
import { useActivatedPluginsSiteAdaptor } from '../manager/site-adaptor.js'
import type { Plugin } from '../types.js'

export const ProfileTabContent = createInjectHooksRenderer<
    Plugin.SiteAdaptor.Definition,
    Plugin.SiteAdaptor.ProfileTabContentProps
>(useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode, (x, props) => {
    const tab = x.ProfileTabs?.find((x) => x.ID === props.tabId)
    return tab?.UI?.TabContent
})

export const ProfileCardTabContent = createInjectHooksRenderer<
    Plugin.SiteAdaptor.Definition,
    Plugin.SiteAdaptor.ProfileTabContentProps
>(useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode, (x, props) => {
    const tab = x.ProfileCardTabs?.find((x) => x.ID === props.tabId)
    return tab?.UI?.TabContent
})

export const SearchResultContent = createInjectHooksRenderer<
    Plugin.SiteAdaptor.Definition,
    Plugin.SiteAdaptor.SearchResultInspectorContentProps
>(useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode, (x, props) => {
    const shouldDisplay = x.SearchResultInspector?.Utils?.shouldDisplay?.(props.currentResult) ?? true
    return shouldDisplay ? x.SearchResultInspector?.UI?.Content : undefined
})

export const SearchResultContentForProfileTab = createInjectHooksRenderer<
    Plugin.SiteAdaptor.Definition,
    Plugin.SiteAdaptor.SearchResultInspectorContentProps
>(useActivatedPluginsSiteAdaptor.visibility.useAnyMode, (x, props) => {
    const shouldDisplay = x.SearchResultInspector?.Utils?.shouldDisplay?.(props.currentResult) ?? true
    return shouldDisplay ? x.SearchResultInspector?.UI?.Content : undefined
})

export const SearchResultTabContent = createInjectHooksRenderer<
    Plugin.SiteAdaptor.Definition,
    Plugin.SiteAdaptor.SearchResultTabContentProps
>(useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode, (x, props) => {
    const tab = x.SearchResultTabs?.find((x) => x.ID === props.tabId)
    return tab?.UI?.TabContent
})
