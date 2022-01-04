import { useState, useEffect } from 'react'
import { useAsync } from 'react-use'
import { DecryptPost } from './DecryptedPost/DecryptedPost'
import Services from '../../extension/service'
import { ProfileIdentifier, type TypedMessageTuple } from '@masknet/shared-base'
import type { Profile } from '../../database'
import { useCurrentIdentity, useFriendsList } from '../DataSource/useActivatedUI'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { PossiblePluginSuggestionPostInspector } from './DisabledPluginSuggestion'

const PluginHooksRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.PostInspector,
)

export interface PostInspectorProps {
    onDecrypted(post: TypedMessageTuple): void
    needZip(): void
    /** @default 'before' */
    slotPosition?: 'before' | 'after'
}
export function PostInspector(props: PostInspectorProps) {
    const postBy = usePostInfoDetails.author()
    const encryptedPost = usePostInfoDetails.containingMaskPayload()
    const whoAmI = useCurrentIdentity()
    const friends = useFriendsList()
    const [alreadySelectedPreviously, setAlreadySelectedPreviously] = useState<Profile[]>([])

    const { value: sharedListOfPost } = useAsync(async () => {
        if (!whoAmI || !whoAmI.identifier.equals(postBy) || !encryptedPost.ok) return []
        const { iv, version } = encryptedPost.val
        return Services.Crypto.getPartialSharedListOfPost(version, iv, postBy)
    }, [postBy, whoAmI, encryptedPost])
    useEffect(() => setAlreadySelectedPreviously(sharedListOfPost ?? []), [sharedListOfPost])

    if (encryptedPost.ok) {
        props.needZip()
    }
    return withAdditionalContent(
        <DecryptPost
            onDecrypted={props.onDecrypted}
            requestAppendRecipients={async () => {
                // TODO
            }}
            alreadySelectedPreviously={alreadySelectedPreviously}
            profiles={friends}
            whoAmI={whoAmI ? whoAmI.identifier : ProfileIdentifier.unknown}
        />,
    )
    // else if (provePost.length) {
    //     // TODO:
    //     return null
    //     // return withAdditionalContent(<AddToKeyStore postBy={postBy} provePost={postContent} />)
    // }
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
