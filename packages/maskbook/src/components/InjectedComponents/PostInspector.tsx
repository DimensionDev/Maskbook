import { useMemo } from 'react'
import { DecryptPost } from './DecryptedPost/DecryptedPost'
import { AddToKeyStore } from './AddToKeyStore'
import type { ProfileIdentifier } from '../../database/type'
import type { TypedMessageTuple } from '@masknet/shared'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'

const PluginHooksRenderer = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (plugin) => plugin.PostInspector)

export interface PostInspectorProps {
    onDecrypted(post: TypedMessageTuple): void
    needZip(): void
    publicKeyUIDecoder(x: string): string[]
    /** @default 'before' */
    slotPosition?: 'before' | 'after'
    currentIdentity: ProfileIdentifier
}
/**
 * This component and it's decedents MUST ONLY rely on PostInfo.
 * SNS Adaptor might not be available.
 */
export function PostInspector(_props: PostInspectorProps) {
    const { needZip, onDecrypted, publicKeyUIDecoder, slotPosition, currentIdentity } = _props
    const postBy = usePostInfoDetails.postBy()
    const postContent = usePostInfoDetails.postContent()
    const encryptedPost = usePostInfoDetails.postPayload()
    const postImages = usePostInfoDetails.postMetadataImages()
    const provePost = useMemo(() => publicKeyUIDecoder(postContent), [postContent, publicKeyUIDecoder])

    if (postBy.isUnknown) return <slot />

    if (encryptedPost.ok || postImages.length) {
        needZip()
        return withAdditionalContent(<DecryptPost onDecrypted={onDecrypted} currentIdentity={currentIdentity} />)
    } else if (provePost.length) {
        return withAdditionalContent(<AddToKeyStore postBy={postBy} provePost={postContent} />)
    }
    return withAdditionalContent(null)
    function withAdditionalContent(x: JSX.Element | null) {
        const slot = encryptedPost.ok ? null : <slot />
        return (
            <>
                {slotPosition !== 'after' && slot}
                {x}
                <PluginHooksRenderer />
                {slotPosition !== 'before' && slot}
            </>
        )
    }
}
