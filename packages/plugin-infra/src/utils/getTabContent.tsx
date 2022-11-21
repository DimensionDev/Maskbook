import { EMPTY_LIST } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { SearchResult } from '@masknet/web3-shared-base'
import { createInjectHooksRenderer } from './createInjectHooksRenderer.js'
import { useActivatedPluginsSNSAdaptor } from '../manager/sns-adaptor.js'
import { I18NStringField, Plugin, useAvailablePlugins } from '../entry.js'

export function getProfileTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode, (x) => {
        const tab = x.ProfileTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

export function getProfileCardTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode, (x) => {
        const tab = x.ProfileCardTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

export function getSettingsTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode, (x) => {
        const tab = x.SettingTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

export function getSearchResultContent(result: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode, (x) => {
        const shouldDisplay = x.SearchResultInspector?.Utils?.shouldDisplay?.(result) ?? true
        return shouldDisplay ? x.SearchResultInspector?.UI?.Content : undefined
    })
}

export function getSearchResultTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode, (x) => {
        const tab = x.SearchResultTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

export function getSearchResultTabs(
    definitions: Plugin.SNSAdaptor.Definition[],
    result: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
    translate: (pluginID: string, field: I18NStringField) => string,
) {
    const displayPlugins = useAvailablePlugins(definitions, (plugins) => {
        if (!result) return EMPTY_LIST
        return plugins
            .flatMap((x) => x.SearchResultTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
            .filter((x) => x?.Utils?.shouldDisplay?.(result) ?? true)
            .sort((a, z) => a.priority - z.priority)
    })
    return displayPlugins.map((x) => ({
        id: x.ID,
        label: typeof x.label === 'string' ? x.label : translate(x.pluginID, x.label),
    }))
}
