import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import type { MetadataRenderProps } from '@masknet/typed-message/dom'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import {
    PossiblePluginSuggestionUI,
    useDisabledPluginSuggestionFromMeta,
    useDisabledPluginSuggestionFromPost,
} from './DisabledPluginSuggestion'
import { MaskPostExtraPluginWrapper } from '../../plugins/MaskPluginWrapper'

const Decrypted = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
    (x) => x.DecryptedInspector,
    MaskPostExtraPluginWrapper,
)
export function DecryptedUI_PluginRendererWithSuggestion(props: MetadataRenderProps) {
    const a = useDisabledPluginSuggestionFromMeta(props.metadata)
    const b = useDisabledPluginSuggestionFromPost(extractTextFromTypedMessage(props.message), [])

    const suggest = Array.from(new Set(a.concat(b)))
    return (
        <>
            <PossiblePluginSuggestionUI plugins={suggest} />
            <Decrypted {...props} />
        </>
    )
}
