import { useMemo } from 'react'
import { PluginID } from '@masknet/shared-base'
import { createInjectHooksRenderer, useActivatedPluginSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useSearchedKeyword } from '../DataSource/useSearchedKeyword.js'

export interface SearchResultBoxProps {}

// Todo: migrate to @masknet/decentralized-search, requires @masknet/social-network.
export function SearchResultBox(props: SearchResultBoxProps) {
    const keyword = useSearchedKeyword()
    const DSearchPlugin = useActivatedPluginSNSAdaptor(PluginID.DecentralizedSearch, 'any')
    const component = useMemo(() => {
        if (!DSearchPlugin) return
        const Component = createInjectHooksRenderer(
            () => [DSearchPlugin],
            (x) => {
                const shouldDisplay = x.SearchResultBox?.Utils?.shouldDisplay?.(keyword) ?? true
                if (!shouldDisplay) return
                return x.SearchResultBox?.UI?.Content
            },
        )
        return <Component keyword={keyword} />
    }, [keyword, DSearchPlugin])

    if (!keyword) return null
    return <>{component}</>
}
