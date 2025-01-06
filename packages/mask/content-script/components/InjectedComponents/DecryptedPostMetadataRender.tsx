import { createInjectHooksRenderer, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import type { MetadataRenderProps } from '@masknet/typed-message-react'
import { useMemo } from 'react'
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

export function DecryptedUIPluginRendererWithSuggestion(props: MetadataRenderProps) {
    const a = useDisabledPluginSuggestionFromMeta(props.metadata)
    const b = useDisabledPluginSuggestionFromPost(extractTextFromTypedMessage(props.message), [])
    const suggest = useMemo(() => Array.from(new Set(a.concat(b))), [a, b])

    return (
        <>
            <PossiblePluginSuggestionUI plugins={suggest} />
            <Decrypted {...props} />
        </>
    )
}
