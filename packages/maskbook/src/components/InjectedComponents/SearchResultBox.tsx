import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'

const PluginRenderer = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (x) => x.SearchBoxComponent)
export interface SearchResultBoxProps {}

export function SearchResultBox(props: SearchResultBoxProps) {
    return <PluginRenderer />
}
