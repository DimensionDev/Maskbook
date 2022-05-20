import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'

const PluginRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useAnyMode,
    (x) => x.SearchResultBox,
)

export interface SearchResultBoxProps {}

export function SearchResultBox(props: SearchResultBoxProps) {
    return <PluginRenderer />
}
