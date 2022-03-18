import { useState, useEffect } from 'react'
import { useAsync } from 'react-use'
import { DecryptPost } from './DecryptedPost/DecryptedPost'
import Services from '../../extension/service'
import { ProfileIdentifier } from '@masknet/shared-base'
import type { TypedMessageTuple } from '@masknet/typed-message'
import type { Profile } from '../../database'
import { useCurrentIdentity, useFriendsList } from '../DataSource/useActivatedUI'
import { useValueRef } from '@masknet/shared-base-ui'
import { debugModeSetting } from '../../settings/settings'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { PossiblePluginSuggestionPostInspector } from './DisabledPluginSuggestion'
import { MaskPostExtraPluginWrapper } from '../../plugins/MaskPluginWrapper'

const PluginHooksRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.PostInspector,
    MaskPostExtraPluginWrapper,
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
    const ownersKeyEncrypted = usePostInfoDetails.ownersKeyEncrypted()
    const version = usePostInfoDetails.version()
    const iv = usePostInfoDetails.iv()
    const postImages = usePostInfoDetails.postMetadataImages()
    const isDebugging = useValueRef(debugModeSetting)
    const whoAmI = useCurrentIdentity()
    const friends = useFriendsList()
    const [alreadySelectedPreviously, setAlreadySelectedPreviously] = useState<Profile[]>([])

    const { value: sharedListOfPost } = useAsync(async () => {
        if (!whoAmI || !whoAmI.identifier.equals(postBy) || !encryptedPost.ok) return []
        const { iv, version } = encryptedPost.val
        return Services.Crypto.getPartialSharedListOfPost(version, iv, postBy)
    }, [postBy, whoAmI, encryptedPost])
    useEffect(() => setAlreadySelectedPreviously(sharedListOfPost ?? []), [sharedListOfPost])

    if (encryptedPost.ok || postImages.length) {
        if (!isDebugging) props.needZip()
        return withAdditionalContent(
            <DecryptPost
                onDecrypted={props.onDecrypted}
                requestAppendRecipients={
                    // version -40 does not support append receiver
                    // version -37 is not implemented yet.
                    ownersKeyEncrypted && iv && version && version !== -40 && version !== -37
                        ? async (profile) => {
                              setAlreadySelectedPreviously(alreadySelectedPreviously.concat(profile))
                              return Services.Crypto.appendShareTarget(
                                  version,
                                  ownersKeyEncrypted,
                                  iv,
                                  profile.map((x) => x.identifier),
                                  whoAmI!.identifier,
                                  { type: 'direct', at: new Date() },
                              )
                          }
                        : undefined
                }
                alreadySelectedPreviously={alreadySelectedPreviously}
                profiles={friends}
                whoAmI={whoAmI ? whoAmI.identifier : ProfileIdentifier.unknown}
            />,
        )
    }
    return withAdditionalContent(null)
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
