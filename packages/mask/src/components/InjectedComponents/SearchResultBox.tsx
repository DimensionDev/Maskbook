import { useMemo } from 'react'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useSearchedKeyword } from '../DataSource/useSearchedKeyword'
import { useDisabledPlugins } from './DisabledPluginSuggestion'

function getSearchResultContent(keyword: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
        const disabledPlugins = useDisabledPlugins()
        const shouldDisplay =
            (x.SearchResultBox?.Utils?.shouldDisplay?.(keyword) &&
                !disabledPlugins.map((p) => p.ID).includes(x.SearchResultBox?.ID)) ??
            true
        if (!shouldDisplay) return
        return x.SearchResultBox?.UI?.Content
    })
}

export interface SearchResultBoxProps {}

export function SearchResultBox(props: SearchResultBoxProps) {
    const keyword = useSearchedKeyword()

    const component = useMemo(() => {
        const Component = getSearchResultContent(keyword)
        return <Component keyword={keyword} />
    }, [keyword])

    if (!keyword) return null
    return <>{component}</>
}
