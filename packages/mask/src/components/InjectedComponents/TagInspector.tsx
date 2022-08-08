import { createInjectHooksRenderer, TagType, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'

const PluginRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useAnyMode,
    (x) => x.TagInspector?.UI?.TagInspector,
)

export interface TagInspectorProps {
    type: TagType
    name: string
}

export function TagInspector(props: TagInspectorProps) {
    return <PluginRenderer {...props} />
}
