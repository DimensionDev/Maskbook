import { useState, useEffect, useMemo } from 'react'
import { useAsync } from 'react-use'
import { DecryptPost, DecryptPostProps } from './DecryptedPost/DecryptedPost'
import { AddToKeyStore, AddToKeyStoreProps } from './AddToKeyStore'
import Services from '../../extension/service'
import { ProfileIdentifier } from '../../database/type'
import type { Profile } from '../../database'
import { useCurrentIdentity, useFriendsList } from '../DataSource/useActivatedUI'
import { useValueRef } from '@masknet/shared'
import { debugModeSetting } from '../../settings/settings'
import { DebugList } from '../DebugModeUI/DebugList'
import type { TypedMessageTuple } from '@masknet/shared'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import type { PayloadAlpha40_Or_Alpha39, PayloadAlpha38 } from '../../utils/type-transform/Payload'
import { decodePublicKeyUI } from '../../social-network/utils/text-payload-ui'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { PossiblePluginSuggestionPostInspector } from './DisabledPluginSuggestion'

const PluginHooksRenderer = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (plugin) => plugin.PostInspector)

export interface PostInspectorProps {
    onDecrypted(post: TypedMessageTuple): void
    needZip(): void
    DecryptPostProps?: Partial<DecryptPostProps>
    DecryptPostComponent?: React.ComponentType<DecryptPostProps>
    AddToKeyStoreProps?: Partial<AddToKeyStoreProps>
    AddToKeyStoreComponent?: React.ComponentType<AddToKeyStoreProps>
    /** @default 'before' */
    slotPosition?: 'before' | 'after'
}
export function PostInspector(props: PostInspectorProps) {
    const postBy = usePostInfoDetails.postBy()
    const postContent = usePostInfoDetails.postContent()
    const encryptedPost = usePostInfoDetails.postPayload()
    const postId = usePostInfoDetails.postIdentifier()
    const decryptedPayloadForImage = usePostInfoDetails.decryptedPayloadForImage()
    const postImages = usePostInfoDetails.postMetadataImages()
    const isDebugging = useValueRef(debugModeSetting)
    const whoAmI = useCurrentIdentity()
    const friends = useFriendsList()
    const [alreadySelectedPreviously, setAlreadySelectedPreviously] = useState<Profile[]>([])
    const provePost = useMemo(() => decodePublicKeyUI(postContent), [postContent])

    const { value: sharedListOfPost } = useAsync(async () => {
        if (!whoAmI || !whoAmI.identifier.equals(postBy) || !encryptedPost.ok) return []
        const { iv, version } = encryptedPost.val
        return Services.Crypto.getPartialSharedListOfPost(version, iv, postBy)
    }, [postBy, whoAmI, encryptedPost])
    useEffect(() => setAlreadySelectedPreviously(sharedListOfPost ?? []), [sharedListOfPost])

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
        const DecryptPostX = props.DecryptPostComponent || DecryptPost
        return withAdditionalContent(
            <DecryptPostX
                onDecrypted={props.onDecrypted}
                requestAppendRecipients={
                    // So should not create new data on version -40
                    (encryptedPost.ok && encryptedPost.val.version !== -40) || decryptedPayloadForImage
                        ? async (profile) => {
                              const val = (postImages ? decryptedPayloadForImage : encryptedPost.val) as
                                  | PayloadAlpha40_Or_Alpha39
                                  | PayloadAlpha38

                              const { iv, version } = val
                              const ownersAESKeyEncrypted =
                                  val.version === -38 ? val.AESKeyEncrypted : val.ownersAESKeyEncrypted

                              setAlreadySelectedPreviously(alreadySelectedPreviously.concat(profile))
                              return Services.Crypto.appendShareTarget(
                                  version,
                                  ownersAESKeyEncrypted,
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
                {...props.DecryptPostProps}
            />,
        )
    } else if (provePost.length) {
        const AddToKeyStoreX = props.AddToKeyStoreComponent || AddToKeyStore
        if (!AddToKeyStoreX) return null
        return withAdditionalContent(
            <AddToKeyStoreX postBy={postBy} provePost={postContent} {...props.AddToKeyStoreProps} />,
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
                {debugInfo}
                {props.slotPosition !== 'before' && slot}
            </>
        )
    }
}
