import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'

const PluginRenderer = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (x) => x.SearchResult)

export interface SearchResultProps {}

export function SearchResult(props: SearchResultProps) {
    return <PluginRenderer />
}
