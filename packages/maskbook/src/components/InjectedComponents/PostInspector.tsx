import { useEffect, useMemo, useRef } from 'react'
import { DecryptPost } from './DecryptedPost/DecryptedPost'
import { AddToKeyStore } from './AddToKeyStore'
import type { ProfileIdentifier } from '../../database/type'
import type { TypedMessageTuple } from '@dimensiondev/maskbook-shared'
import type { PluginConfig } from '../../plugins/types'
import { PluginUI } from '../../plugins/PluginUI'
import { usePostInfoDetails, usePostInfo } from '../DataSource/usePostInfo'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@dimensiondev/mask-plugin-infra'

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
                <OldPluginPostInspector />
                {slotPosition === 'after' && slot}
            </>
        )
    }
}
function OldPluginPostInspector() {
    return (
        <>
            {[...PluginUI.values()].map((x) => (
                <ErrorBoundary subject={`Plugin "${x.pluginName}"`} key={x.identifier}>
                    <PluginPostInspectorForEach config={x} />
                </ErrorBoundary>
            ))}
        </>
    )
}
function PluginPostInspectorForEach({ config }: { config: PluginConfig }) {
    const ref = useRef<HTMLDivElement>(null)
    const F = config.postInspector
    const post = usePostInfo()
    useEffect(() => {
        if (!ref.current || !F || typeof F === 'function') return
        return F.init(post, {}, ref.current)
    }, [F, post])
    if (!F) return null
    if (typeof F === 'function') return <F />
    return <div ref={ref} />
}
