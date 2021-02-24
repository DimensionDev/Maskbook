import type { PluginConfig } from '../../plugins/types'
import { PluginUI } from '../../plugins/PluginUI'
import { ErrorBoundary } from '../shared/ErrorBoundary'

export interface SearchResultBoxProps {}

export function SearchResultBox(props: SearchResultBoxProps) {
    return (
        <>
            {[...PluginUI.values()].map((x) => (
                <ErrorBoundary subject={`Plugin "${x.pluginName}"`} key={x.identifier}>
                    <PluginSearchResultBoxForEach config={x} />
                </ErrorBoundary>
            ))}
        </>
    )
}

function PluginSearchResultBoxForEach({ config }: { config: PluginConfig }) {
    const F = config.SearchBoxComponent
    if (typeof F === 'function') return <F />
    return null
}
