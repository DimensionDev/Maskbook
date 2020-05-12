import React, { useState, useEffect } from 'react'
import { useAsync } from 'react-use'
import { DecryptPost, DecryptPostProps } from './DecryptedPost/DecryptedPost'
import { AddToKeyStore, AddToKeyStoreProps } from './AddToKeyStore'
import { deconstructPayload } from '../../utils/type-transform/Payload'
import Services from '../../extension/service'
import { ProfileIdentifier, PostIdentifier } from '../../database/type'
import type { Profile } from '../../database'
import { useCurrentIdentity, useFriendsList } from '../DataSource/useActivatedUI'
import { getActivatedUI } from '../../social-network/ui'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { debugModeSetting } from '../shared-settings/settings'
import { DebugList } from '../DebugModeUI/DebugList'
import type { TypedMessage } from '../../extension/background-script/CryptoServices/utils'
import { GitCoinConfig } from '../../plugins/Gitcoin/define'
import { PluginUI } from '../../plugins/plugin'

export interface PostInspectorProps {
    onDecrypted(post: TypedMessage, raw: string): void
    post: string
    postBy: ProfileIdentifier
    postId: PostIdentifier<ProfileIdentifier>
    needZip(): void
    DecryptPostProps?: Partial<DecryptPostProps>
    DecryptPostComponent?: React.ComponentType<DecryptPostProps>
    AddToKeyStoreProps?: Partial<AddToKeyStoreProps>
    AddToKeyStoreComponent?: React.ComponentType<AddToKeyStoreProps>
}
export function PostInspector(props: PostInspectorProps) {
    const { post, postBy, postId } = props
    const whoAmI = useCurrentIdentity()
    const people = useFriendsList()
    const [alreadySelectedPreviously, setAlreadySelectedPreviously] = useState<Profile[]>([])
    const decodeAsPublicKey = getActivatedUI().publicKeyDecoder(post)
    const isDebugging = useValueRef(debugModeSetting)
    const type = {
        encryptedPost: deconstructPayload(post, getActivatedUI().payloadDecoder),
        provePost: decodeAsPublicKey,
        extraCanvas: post.toLowerCase().includes('gitcoin'),
    }

    const { value: sharedListOfPost } = useAsync(async () => {
        if (!whoAmI || !whoAmI.identifier.equals(postBy) || !type.encryptedPost) return []
        const { iv, version } = type.encryptedPost
        return Services.Crypto.getSharedListOfPost(version, iv, postBy)
    }, [post, postBy, whoAmI])
    useEffect(() => setAlreadySelectedPreviously(sharedListOfPost ?? []), [sharedListOfPost])

    if (postBy.isUnknown) return null

    const debugInfo = isDebugging ? (
        <DebugList
            items={[
                ['Post by', props.postBy.userId],
                [
                    'Who am I',
                    whoAmI ? `Nickname ${whoAmI.nickname || 'unknown'}, UserID ${whoAmI.identifier.userId}` : 'Unknown',
                ],
                ['My fingerprint', whoAmI?.linkedPersona?.fingerprint ?? 'Unknown'],
                ['Post ID', props.postId.toText() || 'Unknown'],
                ['Post Content', props.post],
            ]}
        />
    ) : null

    if (type.encryptedPost) {
        if (!isDebugging) props.needZip()
        const { iv, version } = type.encryptedPost
        const ownersAESKeyEncrypted =
            type.encryptedPost.version === -38
                ? type.encryptedPost.AESKeyEncrypted
                : type.encryptedPost.ownersAESKeyEncrypted
        const DecryptPostX = props.DecryptPostComponent || DecryptPost
        return withAdditionalContent(
            <DecryptPostX
                onDecrypted={props.onDecrypted}
                requestAppendRecipients={
                    // Version -40 is leaking info
                    // So should not create new data on version -40
                    type.encryptedPost.version === -40
                        ? undefined
                        : async (people) => {
                              setAlreadySelectedPreviously(alreadySelectedPreviously.concat(people))
                              return Services.Crypto.appendShareTarget(
                                  version,
                                  ownersAESKeyEncrypted,
                                  iv,
                                  people.map((x) => x.identifier),
                                  whoAmI!.identifier,
                                  { type: 'direct', at: new Date() },
                              )
                          }
                }
                alreadySelectedPreviously={alreadySelectedPreviously}
                profiles={people}
                postId={postId}
                encryptedText={post}
                whoAmI={whoAmI ? whoAmI.identifier : ProfileIdentifier.unknown}
                postBy={postBy}
                {...props.DecryptPostProps}
            />,
        )
    } else if (type.provePost.length) {
        const AddToKeyStoreX = props.AddToKeyStoreComponent || AddToKeyStore
        if (!AddToKeyStoreX) return null
        return withAdditionalContent(<AddToKeyStoreX postBy={postBy} provePost={post} {...props.AddToKeyStoreProps} />)
    }
    return withAdditionalContent(null)
    function withAdditionalContent(x: JSX.Element | null) {
        return (
            <>
                {x}
                <PluginPostInspector post={post} />
                {debugInfo}
            </>
        )
    }
}
function PluginPostInspector(props: { post: string }) {
    return (
        <>
            {[...PluginUI.values()]
                .filter((x) => x.shouldActivateInPostInspector(props.post))
                .map((X) => (
                    <X.PostInspectorComponent key={X.identifier} {...props} />
                ))}
        </>
    )
}
