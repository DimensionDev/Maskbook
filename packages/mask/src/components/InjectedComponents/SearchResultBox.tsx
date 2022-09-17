import { useMemo } from 'react'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useSearchedKeyword } from '../DataSource/useSearchedKeyword.js'

function getSearchResultContent(keyword: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode, (x) => {
        const shouldDisplay = x.SearchResultBox?.Utils?.shouldDisplay?.(keyword) ?? true
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
