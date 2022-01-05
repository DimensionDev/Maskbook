import { DecryptedPosts } from './DecryptedPost/DecryptedPost'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { PossiblePluginSuggestionPostInspector } from './DisabledPluginSuggestion'

const PluginHooksRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.PostInspector,
)

export interface PostInspectorProps {
    needZip(): void
    /** @default 'before' */
    slotPosition?: 'before' | 'after'
}
export function PostInspector(props: PostInspectorProps) {
    const postBy = usePostInfoDetails.author()
    const encryptedPost = { ok: false } // usePostInfoDetails.containingMaskPayload()

    // if (encryptedPost.ok) {
    //     props.needZip()
    // }
    return withAdditionalContent(<DecryptedPosts />)
    function withAdditionalContent(x: JSX.Element | null) {
        const slot = encryptedPost.ok ? null : <slot />
        return (
            <>
                {process.env.NODE_ENV === 'development' && postBy.isUnknown ? (
                    <h2 style={{ background: 'red', color: 'white' }}>Please fix me. Post author is $unknown</h2>
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
