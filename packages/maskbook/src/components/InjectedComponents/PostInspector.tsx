import { useEffect, useMemo, useRef } from 'react'
import { DecryptPost } from './DecryptedPost/DecryptedPost'
import { AddToKeyStore } from './AddToKeyStore'
import { ProfileIdentifier } from '../../database/type'
import { useCurrentIdentity } from '../DataSource/useActivatedUI'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { debugModeSetting } from '../../settings/settings'
import { DebugList } from '../DebugModeUI/DebugList'
import type { TypedMessageTuple } from '@masknet/shared'
import type { PluginConfig } from '../../plugins/types'
import { PluginUI } from '../../plugins/PluginUI'
import { usePostInfoDetails, usePostInfo } from '../DataSource/usePostInfo'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import { decodePublicKeyUI } from '../../social-network/utils/text-payload-ui'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'

const PluginHooksRenderer = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (plugin) => plugin.PostInspector)

export interface PostInspectorProps {
    onDecrypted(post: TypedMessageTuple): void
    needZip(): void
    /** @default 'before' */
    slotPosition?: 'before' | 'after'
}
export function PostInspector(props: PostInspectorProps) {
    const postBy = usePostInfoDetails.postBy()
    const postContent = usePostInfoDetails.postContent()
    const encryptedPost = usePostInfoDetails.postPayload()
    const postId = usePostInfoDetails.postIdentifier()
    const postImages = usePostInfoDetails.postMetadataImages()
    const isDebugging = useValueRef(debugModeSetting)
    const whoAmI = useCurrentIdentity()
    const provePost = useMemo(() => decodePublicKeyUI(postContent), [postContent])

    if (postBy.isUnknown) return <slot />

    const debugInfo = isDebugging ? (
        <DebugList
            items={[
                ['Post by', postBy.userId],
                [
                    'Who am I',
                    whoAmI ? `Nickname ${whoAmI.nickname || 'unknown'}, UserID ${whoAmI.identifier.userId}` : 'Unknown',
                ],
                ['My fingerprint', whoAmI?.linkedPersona?.fingerprint ?? 'Unknown'],
                ['Post ID', postId?.toText() || 'Unknown'],
                ['Post Content', postContent],
                ['Post Attachment Links', JSON.stringify(postImages)],
            ]}
        />
    ) : null

    if (encryptedPost.ok || postImages.length) {
        if (!isDebugging) props.needZip()
        return withAdditionalContent(
            <DecryptPost
                onDecrypted={props.onDecrypted}
                whoAmI={whoAmI ? whoAmI.identifier : ProfileIdentifier.unknown}
            />,
        )
    } else if (provePost.length) {
        return withAdditionalContent(<AddToKeyStore postBy={postBy} provePost={postContent} />)
    }
    return withAdditionalContent(null)
    function withAdditionalContent(x: JSX.Element | null) {
        const slot = encryptedPost.ok ? null : <slot />
        return (
            <>
                {props.slotPosition !== 'after' && slot}
                {x}
                <PluginHooksRenderer />
                <OldPluginPostInspector />
                {debugInfo}
                {props.slotPosition !== 'before' && slot}
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
        return F.init(post!, {}, ref.current)
    }, [F, post])
    if (!F) return null
    if (typeof F === 'function') return <F />
    return <div ref={ref} />
}
