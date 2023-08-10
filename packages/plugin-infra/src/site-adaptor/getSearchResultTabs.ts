import { EMPTY_LIST } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { SearchResult } from '@masknet/web3-shared-base'
import type { I18NStringField, Plugin } from '../entry.js'
import { getAvailablePlugins } from '../utils/getAvailablePlugins.js'

export function getSearchResultTabs(
    definitions: readonly Plugin.SiteAdaptor.Definition[],
    result: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
    translate: (pluginID: string, field: I18NStringField) => string,
) {
    const displayPlugins = getAvailablePlugins(definitions, (plugins) => {
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
