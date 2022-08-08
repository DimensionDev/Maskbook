import { createInjectHooksRenderer, TagType, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'

const PluginRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useAnyMode,
    (x) => x.PostTagInspector,
)

export interface PostTagInspectorProps {
    type: TagType
    name: string
}

export function PostTagInspector(props: PostTagInspectorProps) {
    return <PluginRenderer {...props} />
}
