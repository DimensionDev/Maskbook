import { createInjectHooksRenderer, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import type { MetadataRenderProps } from '@masknet/typed-message-react'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import {
    PossiblePluginSuggestionUI,
    useDisabledPluginSuggestionFromMeta,
    useDisabledPluginSuggestionFromPost,
} from './DisabledPluginSuggestion.js'
import { MaskPostExtraPluginWrapperWithPermission } from './PermissionBoundary.js'

const Decrypted = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
    (x) => x.DecryptedInspector,
    MaskPostExtraPluginWrapperWithPermission,
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
