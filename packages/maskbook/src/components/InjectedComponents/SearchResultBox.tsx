import type { PluginConfig } from '../../plugins/types'
import { PluginUI } from '../../plugins/PluginUI'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'

const PluginRenderer = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (x) => x.SearchBoxComponent)
export interface SearchResultBoxProps {}

export function SearchResultBox(props: SearchResultBoxProps) {
    return (
        <>
            <PluginRenderer />
            {[...PluginUI.values()].map((x) => (
                <ErrorBoundary subject={`Plugin "${x.pluginName}"`} key={x.identifier}>
                    <OldPluginSearchResultBoxForEach config={x} />
                </ErrorBoundary>
            ))}
        </>
    )
}

function OldPluginSearchResultBoxForEach({ config }: { config: PluginConfig }) {
    const F = config.SearchBoxComponent
    if (typeof F === 'function') return <F />
    return null
}
