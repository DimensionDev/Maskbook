import { DecryptPost } from './DecryptedPost/DecryptedPost'
import { useCurrentIdentity } from '../DataSource/useActivatedUI'
import {
    usePostInfoDetails,
    createInjectHooksRenderer,
    useActivatedPluginsSNSAdaptor,
} from '@masknet/plugin-infra/content-script'
import { PossiblePluginSuggestionPostInspector } from './DisabledPluginSuggestion'
import { MaskPostExtraPluginWrapper } from '../../plugins/MaskPluginWrapper'
import { useSubscription } from 'use-subscription'
import { PersistentStorages } from '../../../shared'
import { useClassicMaskSNSPluginTheme } from '../../utils'
import { ThemeProvider } from '@mui/material'

const PluginHooksRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.PostInspector,
    MaskPostExtraPluginWrapper,
)

export interface PostInspectorProps {
    zipPost(): void
    /** @default 'before' */
    slotPosition?: 'before' | 'after'
}
export function PostInspector(props: PostInspectorProps) {
    const postBy = usePostInfoDetails.author()
    const hasEncryptedPost = usePostInfoDetails.hasMaskPayload()
    const postImages = usePostInfoDetails.postMetadataImages()
    const isDebugging = useSubscription(PersistentStorages.Settings.storage.debugging.subscription)
    const theme = useClassicMaskSNSPluginTheme()
    const whoAmI = useCurrentIdentity()

    if (hasEncryptedPost || postImages.length) {
        if (!isDebugging) props.zipPost()
        return withAdditionalContent(<DecryptPost whoAmI={whoAmI?.identifier || null} />)
    }
    return withAdditionalContent(null)
    function withAdditionalContent(x: JSX.Element | null) {
        const slot = hasEncryptedPost ? null : <slot />
        return (
            <ThemeProvider theme={theme}>
                {process.env.NODE_ENV === 'development' && !postBy ? (
                    <h2 style={{ background: 'red', color: 'white' }}>Please fix me. Post author is not detected.</h2>
                ) : null}
                {props.slotPosition !== 'after' && slot}
                {x}
                <PossiblePluginSuggestionPostInspector />
                <PluginHooksRenderer />
                {props.slotPosition !== 'before' && slot}
            </ThemeProvider>
        )
    }
}
