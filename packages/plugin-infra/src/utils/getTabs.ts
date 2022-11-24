import { EMPTY_LIST } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { SearchResult } from '@masknet/web3-shared-base'
import { I18NStringField, Plugin, useAvailablePlugins } from '../entry.js'

export function getSearchResultTabs(
    definitions: Plugin.SNSAdaptor.Definition[],
    result: SearchResult<Web3Helper.ChainIdAll>,
    translate: (pluginID: string, field: I18NStringField) => string,
) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
