import { DecryptPost } from './DecryptedPost/DecryptedPost.js'
import { useCurrentIdentity } from '../DataSource/useActivatedUI.js'
import {
    usePostInfoDetails,
    createInjectHooksRenderer,
    useActivatedPluginsSiteAdaptor,
} from '@masknet/plugin-infra/content-script'
import { PossiblePluginSuggestionPostInspector } from './DisabledPluginSuggestion.js'
import { useSubscription } from 'use-subscription'
import { PersistentStorages } from '../../../shared/index.js'
import { MaskPostExtraPluginWrapperWithPermission } from './PermissionBoundary.js'

const PluginHooksRenderer = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.PostInspector,
    MaskPostExtraPluginWrapperWithPermission,
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
    const whoAmI = useCurrentIdentity()

    if (hasEncryptedPost || postImages.length) {
        if (!isDebugging) props.zipPost()
        return withAdditionalContent(<DecryptPost whoAmI={whoAmI?.identifier || null} />)
    }
    return withAdditionalContent(null)
    function withAdditionalContent(x: JSX.Element | null) {
        const slot = hasEncryptedPost ? null : <slot />
        return (
            <>
                {process.env.NODE_ENV === 'development' && !postBy ? (
                    <h2 style={{ background: 'red', color: 'white' }}>Please fix me. Post author is not detected.</h2>
                ) : null}
                {props.slotPosition !== 'after' && slot}
                {x}
                <PossiblePluginSuggestionPostInspector />
                <PluginHooksRenderer />
                {props.slotPosition !== 'before' && slot}
            </>
        )
    }
}
