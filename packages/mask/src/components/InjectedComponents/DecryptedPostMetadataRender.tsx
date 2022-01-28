import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import type { MetadataRenderProps } from '@masknet/typed-message/dom'
import { extractTextFromTypedMessage } from '@masknet/typed-message/base'
import {
    PossiblePluginSuggestionUI,
    useDisabledPluginSuggestionFromMeta,
    useDisabledPluginSuggestionFromPost,
} from './DisabledPluginSuggestion'

const PluginRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
    (x) => x.DecryptedInspector,
)
export function PluginRendererWithSuggestion(props: MetadataRenderProps) {
    const a = useDisabledPluginSuggestionFromMeta(props.metadata)
    const b = useDisabledPluginSuggestionFromPost(extractTextFromTypedMessage(props.message), [])

    const suggest = Array.from(new Set(a.concat(b)))
    return (
        <>
            <PossiblePluginSuggestionUI plugins={suggest} />
            <PluginRenderer {...props} />
        </>
    )
}
