import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'

const PluginRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useAnyMode,
    (x) => x.SearchResultTabs,
)

export interface SearchResultTabsProps {}

export function SearchResultTabs(props: SearchResultTabsProps) {
    return <PluginRenderer />
}
